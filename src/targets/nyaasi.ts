import type { SearchTitlesOptions, TitleHandle, Category, ExtraOptions, GetTitle, GetTitleOptions } from '../../../scannarr/src'
import type { AnitomyResult } from 'anitomyscript'

import { from, Observable, map, mergeMap, combineLatest, startWith, catchError } from 'rxjs'
import { pipe } from 'fp-ts/lib/function'
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
        .querySelector('td:nth-child(1)')
        ?.textContent!
    ),
  english:
    elem
      .querySelector('td:nth-child(1) a')
      ?.getAttribute('title')
      ?.trim()
      .includes('English-translated')!,
  link: 
    new URL(
      elem
        .querySelector('td:nth-child(2)')
        ?.querySelector('a')
        ?.getAttribute('href')
        ?.replace('#comments', '')!,
      'https://nyaa.si'
    ).href,
  name:
    (
      elem.querySelector('td:nth-child(2)')?.querySelector('a:nth-child(2)')
      ?? elem.querySelector('td:nth-child(2)')?.querySelector('a')
    )?.getAttribute('title')!,
  torrentUrl:
    elem
      .querySelector('td:nth-child(3)')
      ?.querySelector('a:nth-child(1)')
      ?.getAttribute('href')!,
  magnet:
    elem
      .querySelector('td:nth-child(3)')
      ?.querySelector('a:nth-child(2)')
      ?.getAttribute('href')!,
  size:
    getBytesFromBiByteString(
      elem
        .querySelector('td:nth-child(4)')
        ?.textContent!
    ),
  uploadDate:
    new Date(
      elem
        .querySelector('td:nth-child(5)')
        ?.textContent!
    ),
  seeders:
    Number(
      elem
        .querySelector('td:nth-child(6)')
        ?.textContent!
    ),
  leechers:
    Number(
      elem
        .querySelector('td:nth-child(7)')
        ?.textContent!
    ),
  downloads:
    Number(
      elem
        .querySelector('td:nth-child(8)')
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
  url?: string
  icon?: string
  name?: string
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
    batch: batch,
    resolution: resolution,
    size: row.size,
    team: team ?? { tag: groupTag },
    tags: [{
        type: 'source',
        value: {
          type: 'torrent-file',
          url: `https://nyaa.si/download/${row.link.split('/').at(4)!}.torrent`,
          seeders: row.seeders,
          leechers: row.leechers,
          magnetUri: row.magnet
        }
      }, {
        type: 'meta' as const,
        value: meta
      },
      // ...teamEpisode ? [
      //   {
      //     type: 'team-episode' as const,
      //     value: teamEpisode
      //   },
      // ] : []
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
  const pageHtml = await (await fetch(`https://nyaa.si/?f=${trustedSources ? 2 : 0}&c=1_2&q=${encodeURIComponent(search)}`)).text()
  const doc =
    new DOMParser()
      .parseFromString(pageHtml, 'text/html')
  const cards =
    Promise.all(
      [...doc.querySelectorAll('tr')]
        .slice(1)
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
      // Only search names with decent score
      A.filter(name => name.score >= 0.8),
      A.map(({ name }) => name),
      // Name is problably an abbreviation that will only resuslt in bad search results
      A.filter(name => name.length > 3),
      A.map((name) => `${name} ${number ? number.toString().padStart(2, '0') : ''}`),
      A.map((episodeName) => `(${episodeName})`),
      join('|')
    )

  // const search = `${mostCommonSubnames ? mostCommonSubnames : title.names.find((name) => name.language === 'ja-en')?.name} ${number ? number.toString().padStart(2, '0') : ''}`

  // todo: check if sorting by seeders cause issues
  const pageHtml = await (await fetch(`https://nyaa.si/?f=${trustedSources ? 2 : 0}&c=1_2&q=${encodeURIComponent(search)}&s=seeders&o=desc`)).text()
  const doc =
    new DOMParser()
      .parseFromString(pageHtml, 'text/html')
  const episodes =
    combineLatest(
      [...doc.querySelectorAll('tr')]
        .slice(1)
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

export const getTitle: GetTitle = (options: GetTitleOptions, { fetch }: ExtraOptions) => from((async () => {
  console.log('nyaa getTitle', options)
  if (!('uri' in options && options.uri)) return from([])
  const { id } = fromUri(options.uri) ?? options

  const doc =
    new DOMParser()
      .parseFromString(await (await fetch(nyaaIdToPageUrl(id))).text(), 'text/html')
  const titleElement = doc.querySelector<HTMLHeadingElement>('body > div > div:nth-child(1) > div.panel-heading > h3')
  const categoryElement = doc.querySelector<HTMLAnchorElement>('body > div > div:nth-child(1) > div.panel-body > div:nth-child(1) > div:nth-child(2) > a:nth-child(1)')
  const categoryLanguageElement = doc.querySelector<HTMLAnchorElement>('body > div > div:nth-child(1) > div.panel-body > div:nth-child(1) > div:nth-child(2) > a:nth-child(2)')
  const fileSizeElement = doc.querySelector<HTMLDivElement>('body > div > div.panel.panel-success > div.panel-body > div:nth-child(4) > div:nth-child(2)')
  const submitterElement = doc.querySelector<HTMLAnchorElement>('body > div > div.panel.panel-success > div.panel-body > div:nth-child(2) > div:nth-child(2) > a')
  const informationElement = doc.querySelector<HTMLAnchorElement>('body > div > div.panel.panel-success > div.panel-body > div:nth-child(3) > div:nth-child(2) > a')
  const descriptionElement = doc.querySelector<HTMLDivElement>('#torrent-description')
  const commentElements = [...doc.querySelectorAll<HTMLDivElement>('#comments .comment-panel')]
  const seedersElement = doc.querySelector<HTMLSpanElement>('body > div > div.panel.panel-success > div.panel-body > div:nth-child(2) > div:nth-child(4) > span')
  const leechersElement = doc.querySelector<HTMLSpanElement>('body > div > div.panel.panel-success > div.panel-body > div:nth-child(3) > div:nth-child(4) > span')
  const magnetElement = doc.querySelector<HTMLAnchorElement>('body > div > div.panel.panel-success > div.panel-footer.clearfix > a.card-footer-item')
  if (!titleElement) throw new Error(`No title element found on page ${nyaaIdToPageUrl(id)}`)
  if (!categoryElement) throw new Error(`No category element found on page ${nyaaIdToPageUrl(id)}`)
  if (!categoryLanguageElement) throw new Error(`No category language element found on page ${nyaaIdToPageUrl(id)}`)
  if (!fileSizeElement) throw new Error(`No file size element found on page ${nyaaIdToPageUrl(id)}`)
  // if (!submitterElement) throw new Error(`No submitter element found on page ${nyaaIdToPageUrl(id)}`)
  // if (!informationElement) throw new Error(`No information element found on page ${nyaaIdToPageUrl(id)}`)
  if (!seedersElement) throw new Error(`No seeders element found on page ${nyaaIdToPageUrl(id)}`)
  if (!leechersElement) throw new Error(`No leechers element found on page ${nyaaIdToPageUrl(id)}`)
  if (!magnetElement) throw new Error(`No magnet element found on page ${nyaaIdToPageUrl(id)}`)
  const category = nyaaUrlToCategory(categoryElement.href)
  const categoryLanguage = nyaaUrlToCategory(categoryLanguageElement.href)
  const fileSize = getBytesFromBiByteString(fileSizeElement.textContent!)
  const teamName = submitterElement?.textContent ?? undefined
  const informationUrl = informationElement?.textContent ?? undefined
  const seeders = Number(seedersElement.textContent)
  const leechers = Number(leechersElement.textContent)
  const magnetUri = magnetElement.href

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
    batch: release_information?.toLowerCase() === 'batch',
    categories: category === 'anime' ? ['ANIME' as const] : [],
    comments:
      commentElements
        .map(commentElement => {
          const userLinkElement = commentElement.querySelector<HTMLAnchorElement>('div > div.col-md-2 > p > a')
          const userImageElement = commentElement.querySelector<HTMLImageElement>('div > div.col-md-2 > img')
          const postLinkElement = commentElement.querySelector<HTMLAnchorElement>('div > div.col-md-10.comment > div.row.comment-details > a')
          const postDateElement = commentElement.querySelector<HTMLDivElement>('div > div.col-md-10.comment > div.row.comment-details > a > small')
          const commentMessageElement = commentElement.querySelector<HTMLDivElement>('div > div.col-md-10.comment > div.row.comment-body')

          return {
            url:
              postLinkElement?.href
                ? `https://nyaa.si/view/${id}${postLinkElement?.getAttribute('href')}`
                : undefined,
            user: {
              avatar: userImageElement?.src,
              name: userLinkElement?.textContent!,
              url:
                userLinkElement?.href
                  ? userLinkElement.href.replace(document.location.origin, 'https://nyaa.si')
                  : undefined
            },
            date:
              postDateElement?.textContent
                ? new Date(postDateElement.textContent)
                : undefined,
            message: commentMessageElement?.innerHTML!
          }
        }),
    names: [{
      language:
        categoryLanguage === 'english-translated'
          ? 'en'
          : '',
      name: anime_title!,
      score: 0.6
    }],
    unit: isNaN(Number(anime_season)) ? 1 : Number(anime_season),
    number: Number(episode_number),
    size: fileSize,
    resolution: Number(video_resolution) as Resolution,
    description: descriptionElement?.innerHTML ?? undefined,
    tags: [{
        type: 'source',
        value: {
          type: 'torrent-file',
          url: `https://nyaa.si/download/${id}.torrent`,
          seeders,
          leechers,
          magnetUri
        }
      }
    ],
    team: team ?? (release_group ? team : undefined),
    related: [],
    url: nyaaIdToPageUrl(id)
  })

  return from([]).pipe(
    map(teamInfo => makeTitleHandle()),
    startWith(makeTitleHandle()),
    catchError(err => {
      console.error(err)
      throw err
    })
  )
})()).pipe(
  mergeMap(observable => observable),
  catchError(err => {
    console.error(err)
    throw err
  })
)
