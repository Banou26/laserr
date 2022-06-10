import type { SearchTitlesOptions, TitleHandle, ImageData, FetchType, DateData, Category, SeriesHandle, SearchSeries, SearchTitles, ExtraOptions, GetTitle, GetTitleOptions } from '../../../scannarr/src'
import type { AnitomyResult } from 'anitomyscript'

import { from, merge, Observable, tap, map, first, mergeMap, combineLatest, startWith, finalize, catchError } from 'rxjs'
import { flow, pipe } from 'fp-ts/lib/function'
import * as A from 'fp-ts/lib/Array'
import { join } from 'fp-ts-std/Array'
import pThrottle from 'p-throttle'
import anitomy from 'anitomyscript/dist/anitomyscript.bundle'
import { getBytesFromBiByteString } from '../utils/bytes'
import { fromUri, populateUri } from '../../../scannarr/src/utils'


export const origin = 'https://nyaa.si'
export const categories: Category[] = ['ANIME']
export const name = 'Nyaa'
export const scheme = 'nyaa'

const throttle = pThrottle({
	limit: 2,
	interval: 1_000
})

type Item = {
  category: NyaaCategory
  english: boolean
  name: string
  link: string
  torrentUrl: string
  magnet?: string
  size: number
  uploadDate: Date
  seeders: number
  leechers: number
  downloads: number
}

const nyaaCategories = ['anime', 'audio', 'literature', 'live action', 'pictures', 'software'] as const
const nyaaSubCategories = ['english-translated'] as const
type NyaaCategory = typeof nyaaCategories[number]

const teams: Map<string, Promise<Team>> = new Map()

const addTeam = (tag: string, team: Promise<Team>) => teams.set(tag, team).get(tag)

const removeTeam = (tag) => teams.delete(tag)

const getTeam = (tag: string) => teams.get(tag)

const nyaaIdToPageUrl = (id: number | string) =>
  `https://nyaa.si/view/${id}`

const stringToNyaaCategory =
  (s: string): NyaaCategory =>
    s
      .split('-')
      .at(0)!
      .trim()
      .toLocaleLowerCase() as NyaaCategory

const nyaaCategoryCodeToCategory = (code: string) =>
    code[0] === '1' ? 'anime'
  : code[2] === '2' ? 'english-translated'
  : undefined

const nyaaUrlToCategory = (url: string) =>
  nyaaCategoryCodeToCategory(
    new URL(url).searchParams.get('c')!
  )

const getItem = (elem: HTMLElement): Item => ({
  category:
    stringToNyaaCategory(
      elem
        .querySelector('category')
        ?.textContent!
    ),
  english:
    elem
      .querySelector('category')
      ?.textContent
      ?.trim()
      .includes('English-translated')!,
  link:
    elem
      .querySelector('guid')
      ?.textContent!,
  name:
    elem
      .querySelector('title')
      ?.textContent!,
  torrentUrl:
    elem
      .querySelector('link')
      ?.textContent!,
  // magnet:
  //   elem
  //     .querySelector('td:nth-child(3)')
  //     ?.querySelector('a:nth-child(2)')
  //     ?.getAttribute('href')!,
  size:
    getBytesFromBiByteString(
      elem
        .querySelector('size')
        ?.textContent!
    ),
  uploadDate:
    new Date(
      elem
        .querySelector('pubDate')
        ?.textContent!
    ),
  seeders:
    Number(
      elem
        .querySelector('seeders')
        ?.textContent!
    ),
  leechers:
    Number(
      elem
        .querySelector('leechers')
        ?.textContent!
    ),
  downloads:
    Number(
      elem
        .querySelector('downloads')
        ?.textContent!
    )
})

const resolutions = [480, 540, 720, 1080, 1440, 2160, 4320] as const
type Resolution = typeof resolutions[number]
const releaseType = ['bd' /*Blu-ray disc*/, 'web', 'web-dl', 'hd', 'hc' /*Hardcoded subs*/, 'vod', 'cam', 'tv'] as const
type ReleaseType = typeof releaseType[number]

// todo: add all release types https://nyaa.si/rules & https://en.wikipedia.org/wiki/Pirated_movie_release_types
const getReleaseType = (s: string): ReleaseType | undefined =>
  ['WEBDL', 'WEB DL', 'WEB-DL', 'WEB', 'WEBRip', 'WEB Rip', 'WEB-Rip', 'WEB-DLRip', 'HDRip', 'WEB Cap', 'WEBCAP', 'WEB-Cap', 'HD-Rip'].some(type => s.toLowerCase().includes(type.toLocaleLowerCase())) ? 'web-dl' :
  ['Blu-Ray', 'BluRay', 'BLURAY', 'BDRip', 'BRip', 'BRRip', 'BDR', 'BD25', 'BD50', 'BD5', 'BD9', 'BDMV', 'BDISO', 'COMPLETE.BLURAY'].some(type => s.toLowerCase().includes(type.toLocaleLowerCase())) ? 'bd' :
  undefined

type TitleMetadata = {
  name: string
  group?: string
  batch: boolean
  meta?: string
  resolution?: Resolution
  type?: ReleaseType
}

// todo: implement parser to get better results instead of using regex, test samples:
// [JacobSwaggedUp] Kara no Kyoukai 7: Satsujin Kousatsu (Kou) | The Garden of Sinners Chapter 7: Murder Speculation Part B (BD 1280x720) [MP4 Movie]
// [Judas] Kimetsu no Yaiba (Demon Slayer) - Yuukaku-hen - S03E09 (Ep.42) [1080p][HEVC x265 10bit][Multi-Subs] (Weekly)
// [SubsPlease] Mushoku Tensei (01-23) (1080p) [Batch]
// [SubsPlease] Mushoku Tensei - 23 (1080p) [63077C59].mkv
// [Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu 2nd Season - 12 END [v0][1080p][Multiple Subtitle][E500D275].mkv
// [Erai-raws] Mushoku Tensei - Isekai Ittara Honki Dasu 2nd Season - 11 [v0][1080p][Multiple Subtitle][9B808EC3].mkv
// [MTBB] Mushoku Tensei – Jobless Reincarnation - Volume 3 (BD 1080p)
// [MTBB] Mushoku Tensei – Jobless Reincarnation - Volume 2 (v2) (BD 1080p)
// [MTBB] Mushoku Tensei – Jobless Reincarnation - 23

const getTitleFromTrustedTorrentName = (s: string): TitleMetadata => {
  const regex = /^(\[.*?\])?\s*?(.*?)(?:\s*?(\(.*\))|(\[.*\])|(?:\s*?))*?\s*?(\.\w+)?$/
  const [, group, name] = regex.exec(s) ?? []
  const meta = s.replace(group, '').replace(name, '')
  const batch = s.toLocaleLowerCase().includes('batch')
  const resolution = resolutions.find(resolution => s.includes(resolution.toString()))
  return {
    name,
    group: group?.slice(1, -1),
    meta,
    batch,
    resolution,
    type: getReleaseType(s)
  }
}

type TeamEpisode = {
  url: string
}

type Team = {
  tag: string
  url: string
  icon: string
  name: string
}

// todo: refactor this by making it tied to an episode, right now the informationUrl is global to the tag
const getTorrentAsEpisodeAndTeam = async (tag: string, url: string, { fetch }: ExtraOptions) => {
  const teamPromise = new Promise<[TeamEpisode['url'], Team]>(async resolve => {
    const pageHtml = await (await fetch(url)).text()
    const doc =
      new DOMParser()
        .parseFromString(pageHtml, 'text/html')
    const informationUrl = doc.querySelector<HTMLAnchorElement>('[rel="noopener noreferrer nofollow"]')?.href
    const informationPageFavicon =
      await (
        informationUrl
          ? (
            fetch(informationUrl)
              .then(res => res.text())
              .then(informationPageHtml => {
                const doc =
                  new DOMParser()
                    .parseFromString(informationPageHtml, 'text/html')
                const iconPath = doc.querySelector<HTMLLinkElement>('link[rel*="icon"]')?.href
                if (!iconPath) return undefined
                const faviconUrl = new URL(new URL(iconPath).pathname, new URL(informationUrl).origin).href
                if (!faviconUrl) return undefined
                // todo: check if this causes any issues or if we cant just keep doing that (mostly in terms of image format support)
                // return faviconUrl
                return (
                  fetch(faviconUrl)
                    .then(res => res.blob())
                    .then(blob => URL.createObjectURL(blob))
                )
              })
          )
          : Promise.resolve(undefined)
      ).catch(() => undefined)
    const team = {
      tag,
      url: informationUrl ? new URL(informationUrl).origin : undefined,
      icon: informationPageFavicon,
      name: doc.querySelector<HTMLAnchorElement>('body > div > div.panel.panel-success > div.panel-body > div:nth-child(2) > div:nth-child(2) > a')?.textContent ?? undefined
    }
    resolve([informationUrl, team])
  })
  addTeam(tag, teamPromise.then(res => res[1]))
  const [informationUrl, team] = await teamPromise
  return {
    teamEpisode: undefined,
    // teamEpisode: {
    //   url: informationUrl
    // } as TeamEpisode,
    team
  }
}

export const getItemAsEpisode = (elem: HTMLElement, { fetch }: ExtraOptions): Observable<TitleHandle> => {
  const row = getItem(elem)
  const { name, group: groupTag, meta, batch, resolution, type } = getTitleFromTrustedTorrentName(row.name)
  const number = Number(/((0\d)|(\d{2,}))/.exec(name)?.[1] ?? 1)

  const existingTeam =
    groupTag
      ? getTeam(groupTag)
      : undefined

  const teamInfo =
    existingTeam
      ? existingTeam.then((team) => ({ team }))
      : (
        groupTag
          ? getTorrentAsEpisodeAndTeam(groupTag, row.link, { fetch })
          : Promise.resolve(undefined)
      )
  // const [teamEpisode, team] = existingTeam ? [undefined, await existingTeam] : await getTorrentAsEpisodeAndTeam(groupTag, row.link)

  const makeTitle = ({ teamEpisode, team }: { teamEpisode?: TeamEpisode, team?: Team } = {}): TitleHandle => populateUri({
    id: row.link.split('/').at(4)!,
    scheme: 'nyaa',
    categories: row.category === 'anime' ? ['ANIME' as const] : [],
    names: [{ language: row.english ? 'en' : '', name, score: 0.6 }],
    unit: 1,
    number,
    dates: [],
    images: [],
    releaseDates: [],
    synopses: [],
    handles: [],
    recommended: [],
    tags: [{
        type: 'batch' as const,
        value: batch
      }, {
        type: 'source',
        value: {
          type: 'torrent-file',
          url: `https://nyaa.si/download/${row.link.split('/').at(4)!}.torrent`
        }
      }, {
        type: 'resolution' as const,
        value: resolution
      }, {
        type: 'size' as const,
        value: row.size
      }, {
        type: 'meta' as const,
        value: meta
      },
      ...team ?? groupTag ? [
        {
          type: 'team' as const,
          value: team ?? { tag: groupTag }
        }
      ] : [],
      ...teamEpisode ? [
        {
          type: 'team-episode' as const,
          value: teamEpisode
        },
      ] : []
    ],
    related: [],
    url: row.link,
    // type: 'torrent',
    // resolution,
    // size: row.size,
    // teamEpisode: {
    //   url: undefined,
    //   ...teamEpisode,
    //   team: (await team)!
    // },
    // batch
    // type: getReleaseType(row.name),
    // meta
  })

  return from(teamInfo).pipe(
    map(teamInfo => makeTitle(teamInfo)),
    startWith(makeTitle()),
    catchError((err, item) => void console.log('ERR', err) || item)
  )
}

export const getAnimeTorrents = async ({ search = '' }: { search: string }, { fetch, ...extraOptions }: ExtraOptions) => {
  const trustedSources = true
  const pageHtml = await (await fetch(`https://nyaa.si/?page=rss&f=${trustedSources ? 2 : 0}&c=1_2&q=${encodeURIComponent(search)}`)).text()
  const doc =
    new DOMParser()
      .parseFromString(pageHtml, 'text/xml')
  const cards =
    Promise.all(
      [...doc.querySelectorAll('item')]
        .map(elem => getItemAsEpisode(elem, { ...extraOptions, fetch }))
    )
  const [, count] =
    doc
      .querySelector('.pagination-page-info')!
      .textContent!
      .split(' ')
      .reverse()
  return {
    count: Number(count),
    items: cards
  }
  // console.log('cards', cards)
  // return cards
}

export const _searchTitles = (options: SearchTitlesOptions, { fetch, ...extraOptions }: ExtraOptions) => from((async () => {
  if (!('series' in options && options.series)) return from(Promise.resolve([]))
  if (!('search' in options && options.search)) return from(Promise.resolve([]))
  const { series, search: _search } = options
  if (typeof _search === 'string') return from(Promise.resolve([]))
  const names = series?.names
  const number = _search.number
  
  const trustedSources = true

  // todo: check if names containing parenthesis will cause problems with nyaa.si search engine
  const search =
    pipe(
      names,
      A.map(({ name }) => name),
      A.map((name) => `${name} ${number ? number.toString().padStart(2, '0') : ''}`),
      A.map((episodeName) => `(${episodeName})`),
      join('|')
    )

  // const search = `${mostCommonSubnames ? mostCommonSubnames : title.names.find((name) => name.language === 'ja-en')?.name} ${number ? number.toString().padStart(2, '0') : ''}`

  const pageHtml = await (await fetch(`https://nyaa.si/?page=rss&f=${trustedSources ? 2 : 0}&c=1_2&q=${encodeURIComponent(search)}`)).text()
  const doc =
    new DOMParser()
      .parseFromString(pageHtml, 'text/xml')
  const episodes =
    combineLatest(
      [...doc.querySelectorAll('item')]
        .map(elem => getItemAsEpisode(elem, { ...extraOptions, fetch }))
    )

  // const Team = {
  //   EqByTag: {
  //     equals: (teamX: Team, teamY: Team) => teamX.tag === teamY.tag
  //   }
  // }
  
  // const findNewTeams =
  //   (episodes: Impl<TitleHandle>[]) =>
  //     (teams: Team[]) =>
  //       pipe(
  //         episodes,
  //         A.filter<Impl<TitleHandle> & { teamEpisode: TeamEpisode }>((ep: Impl<TitleHandle>) => !!ep.teamEpisode.team),
  //         A.filter((ep) => !A.elem(Team.EqByTag)(ep.teamEpisode.team)(teams)),
  //         A.map(ep => ep.teamEpisode.team),
  //         A.uniq(Team.EqByTag)
  //       )

  // const newTeams = findNewTeams(episodes)(await Promise.all(teams.values()))
  // console.log('newTeams', newTeams)
  return episodes
})()).pipe(mergeMap(observable => observable))

export const searchTitles = (options: SearchTitlesOptions, { fetch }: ExtraOptions) => {
  const throttledFetch: ExtraOptions['fetch'] = throttle((...args) => fetch(...args))
  return _searchTitles(options, { fetch: throttledFetch })
}

export const getTitle: GetTitle = async (options: GetTitleOptions, { fetch }: ExtraOptions) => {
  console.log('1')
  if (!('uri' in options && options.uri)) return undefined
  const { id } = fromUri(options.uri) ?? options
  console.log('2', id)

  const doc =
    new DOMParser()
      .parseFromString(await (await fetch(nyaaIdToPageUrl(id))).text(), 'text/html')
  console.log('3', doc)
  const iconPath = doc.querySelector<HTMLLinkElement>('link[rel*="icon"]')?.href
  if (!iconPath) return undefined
  console.log('4')
  const faviconUrl = new URL(new URL(iconPath).pathname, new URL(nyaaIdToPageUrl(id)).origin).href
  const titleElement = doc.querySelector<HTMLHeadingElement>('body > div > div:nth-child(1) > div.panel-heading > h3')
  const categoryElement = doc.querySelector<HTMLAnchorElement>('body > div > div:nth-child(1) > div.panel-body > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)')
  const categoryLanguageElement = doc.querySelector<HTMLAnchorElement>('body > div > div:nth-child(1) > div.panel-body > div:nth-child(1) > div:nth-child(2) > a:nth-child(2)')
  const fileSizeElement = doc.querySelector<HTMLDivElement>('body > div > div.panel.panel-success > div.panel-body > div:nth-child(4) > div:nth-child(2)')
  const submitterElement = doc.querySelector<HTMLAnchorElement>('body > div > div.panel.panel-success > div.panel-body > div:nth-child(2) > div:nth-child(2) > a')
  const informationElement = doc.querySelector<HTMLAnchorElement>('body > div > div.panel.panel-success > div.panel-body > div:nth-child(3) > div:nth-child(2) > a')
  if (!titleElement) throw new Error(`No title element found on page ${nyaaIdToPageUrl(id)}`)
  if (!categoryElement) throw new Error(`No category element found on page ${nyaaIdToPageUrl(id)}`)
  if (!categoryLanguageElement) throw new Error(`No category language element found on page ${nyaaIdToPageUrl(id)}`)
  if (!fileSizeElement) throw new Error(`No file size element found on page ${nyaaIdToPageUrl(id)}`)
  if (!submitterElement) throw new Error(`No submitter element found on page ${nyaaIdToPageUrl(id)}`)
  if (!informationElement) throw new Error(`No information element found on page ${nyaaIdToPageUrl(id)}`)
  const category = nyaaUrlToCategory(categoryElement.href)
  const categoryLanguage = nyaaUrlToCategory(categoryLanguageElement.href)
  const fileSize = getBytesFromBiByteString(fileSizeElement.textContent!)
  const teamName = submitterElement.textContent!
  const informationUrl = informationElement.textContent!
  console.log('5')

  // const { name, number, batch, resolution,  } = getTitleFromTrustedTorrentName(titleElement.innerText)
  const anitomyResult = await anitomy(titleElement.textContent!) as AnitomyResult
  // todo: if this is a batch (number is a list of episode numbers), should probably have a system to switch from Title -> Series -> Title[]
  const {
    anime_title,
    anime_season,
    episode_number,
    release_information,
    video_resolution,
    release_group
  } = anitomyResult

  // const informationPageFavicon =
  //   informationUrl
  //     ? (
  //       fetch(informationUrl)
  //         .then(res => res.text())
  //         .then(informationPageHtml => {
  //           const doc =
  //             new DOMParser()
  //               .parseFromString(informationPageHtml, 'text/html')
  //           const iconPath = doc.querySelector<HTMLLinkElement>('link[rel*="icon"]')?.href
  //           if (!iconPath) return undefined
  //           const faviconUrl = new URL(new URL(iconPath).pathname, new URL(informationUrl).origin).href
  //           if (!faviconUrl) return undefined
  //           // todo: check if this causes any issues or if we cant just keep doing that (mostly in terms of image format support)
  //           // return faviconUrl
  //           return (
  //             fetch(faviconUrl)
  //               .then(res => res.blob())
  //               .then(blob => URL.createObjectURL(blob))
  //           )
  //         })
  //     )
  //     : Promise.resolve(undefined)

  const team: Team = {
    tag: release_group!,
    name: teamName,
    url: informationUrl,
    icon: ''
  }

  if (Array.isArray(episode_number)) throw new Error(`Nyaa ${nyaaIdToPageUrl(id)} is batch, non supported for now`)

  const makeTitleHandle = (): TitleHandle => populateUri({
    id,
    scheme: 'nyaa',
    categories: category === 'anime' ? ['ANIME' as const] : [],
    names: [{
      language:
        categoryLanguage === 'english-translated'
          ? 'en'
          : '',
      name: anime_title!,
      score: 0.6
    }],
    unit: Number(anime_season),
    number: Number(episode_number),
    dates: [],
    images: [],
    releaseDates: [],
    synopses: [],
    handles: [],
    recommended: [],
    tags: [{
        type: 'batch' as const,
        value: release_information?.toLowerCase() === 'batch'
      }, {
        type: 'source',
        value: {
          type: 'torrent-file',
          url: `https://nyaa.si/download/${row.link.split('/').at(4)!}.torrent`
        }
      }, {
        type: 'resolution' as const,
        value: video_resolution
      }, {
        type: 'size' as const,
        value: fileSize
      },
      // {
      //   type: 'meta' as const,
      //   value: meta
      // },
      ...team ?? release_group ? [
        {
          type: 'team' as const,
          value: team
        }
      ] : [],
      // ...teamEpisode ? [
      //   {
      //     type: 'team-episode' as const,
      //     value: teamEpisode
      //   },
      // ] : []
    ],
    related: [],
    url: nyaaIdToPageUrl(id),
    // type: 'torrent',
    // resolution,
    // size: row.size,
    // teamEpisode: {
    //   url: undefined,
    //   ...teamEpisode,
    //   team: (await team)!
    // },
    // batch
    // type: getReleaseType(row.name),
    // meta
  })

  return makeTitleHandle()
}

// export const categories = ['ANIME']

// export const searchTitles: SearchTitles = (options, extraOptions) => {
//   return from(_searchEpisode(options, extraOptions))
//   // console.log('nyaa searchTitles')
//   // if ('series' in options) {
//   //   return from(_searchEpisode(options, extraOptions))
//   // }
//   // return from([])
// }

// export const getAnimeEpisode = (id: string, episode: number) =>
//   fetch(`https://myanimelist.net/anime/${id}/${id}/episode/${episode}`)
//     .then(async res =>
//       getTitleEpisodeInfo(
//         new DOMParser()
//           .parseFromString(await res.text(), 'text/html')
//       )
//     )


// export const getEpisode: GetEpisode<true> = {
//   scheme: 'nyaa',
//   categories: ['ANIME'],
//   function: (args) => console.log('getEpisode nyaa args', args)
//     // getAnimeEpisode(fromUri(uri!).id.split('-')[0], Number(fromUri(uri!).id.split('-')[1]))
// }

// addTarget({
//   name: 'Nyaa.si',
//   scheme: 'nyaa',
//   categories: ['ANIME'],
//   searchEpisode: {
//     scheme: 'nyaa',
//     categories: ['ANIME'],
//     latest: true,
//     pagination: true,
//     genres: true,
//     score: true,
//     function: (args) => _searchEpisode(args)
//   },
//   icon: 'https://nyaa.si/static/favicon.png'
// })
