// import Category from '../category'
// // import { fetch } from '@mfkn/fkn-lib'
// import { GetGenres, GenreHandle, TitleHandle, Impl } from '../types'
// import { SearchTitle, GetTitle, ReleaseDate, EpisodeHandle, GetEpisode } from '..'
import type Category from '../../../scannarr/src/types/category'
import type DateData from '../../../scannarr/src/types/date'

import { fromUri, languageToTag } from '../utils'

export const origin = 'https://myanimelist.net'
export const categories: Category[] = ['ANIME']
export const name = 'MyAnimeList'
export const scheme = 'mal'

const fixOrigin = (url: string) => url.replace(document.location.origin, 'https://myanimelist.net')

const getDocumentUrl = (doc: Document): string =>
  (
    doc.querySelector<HTMLLinkElement>('head > link[rel="canonical"]')?.href ||
    doc.querySelector<HTMLLinkElement>('head > meta[property="og:url"]')?.getAttribute('content')
  ) as string

const getAnimePageId = (doc: Document) =>
  Number(doc.querySelector('#myinfo_anime_id')?.getAttribute('value'))

// export const getGenres: GetGenres<true> = () =>
//   fetch('https://myanimelist.net/anime.php')
//     .then(res => res.text())
//     .then(text =>
//       [
//         ...new DOMParser()
//         .parseFromString(text, 'text/html')
//         .querySelectorAll('.genre-link')
//       ]
//         .slice(0, 2)
//         .flatMap((elem, i) =>
//           [...elem.querySelectorAll<HTMLAnchorElement>('.genre-name-link')]
//             .map(({ href, textContent }): GenreHandle<true> => ({
//               id: href!.split('/').at(5)!,
//               url: href,
//               adult: !!i,
//               name: textContent!.replace(/(.*) \(.*\)/, '$1')!,
//               categories
//             }))
//             .filter(({ name }) => name)
//         )
//     )

const getSeasonCardInfo = (elem: HTMLElement): Impl<TitleHandle> => ({
  scheme: 'mal',
  categories,
  id: elem.querySelector<HTMLElement>('[id]')!.id.trim(),
  url: elem.querySelector<HTMLAnchorElement>('.link-title')!.href,
  images: [{
    type: 'poster',
    size: 'medium',
    url: elem.querySelector<HTMLImageElement>('img')!.src || elem.querySelector<HTMLImageElement>('img')!.dataset.src!
  }],
  names: [{
    search: true,
    language: 'ja-en',
    name: elem.querySelector('.h2_anime_title')!.textContent!.trim()!
  }],
  synopses: [{
    language: 'en',
    synopsis: elem.querySelector('.preline')!.textContent!.trim()!
  }],
  genres:
    [...elem.querySelectorAll<HTMLAnchorElement>('.genre a')]
      .map(({ textContent, href, parentElement }) => ({
        scheme: 'mal',
        id: href!.split('/').at(5)!,
        adult: parentElement?.classList.contains('explicit'),
        url: fixOrigin(href),
        name: textContent?.trim()!,
        categories
      })),
  releaseDates: [{
    language: 'en',
    date: new Date(elem.querySelector('.prodsrc > .info > span:nth-child(1)')!.textContent!.trim())
  }],
  related: [],
  episodes: [],
  recommended: [],
  tags: [],
  handles: []
})

export const getAnimeSeason = () =>
  fetch('https://myanimelist.net/anime/season')
    .then(async res =>
      [
        ...new DOMParser()
          .parseFromString(await res.text(), 'text/html')
          .querySelectorAll('.seasonal-anime.js-seasonal-anime')
      ]
        .map(getSeasonCardInfo)
    )

const getSearchCardInfo = (elem: HTMLElement): Impl<TitleHandle> => ({
  scheme: 'mal',
  categories,
  id: elem.querySelector<HTMLAnchorElement>('.hoverinfo_trigger.fw-b.fl-l')!.id.trim().replace('sinfo', ''),
  url: elem.querySelector<HTMLAnchorElement>('.hoverinfo_trigger.fw-b.fl-l')!.href,
  images: [{
    type: 'poster',
    size: 'medium',
    url: (elem.querySelector<HTMLImageElement>('.picSurround img')!.src || elem.querySelector<HTMLImageElement>('.picSurround img')!.dataset.src!).replace('r/50x70/', '')
  }],
  names: [{
    search: true,
    language: 'ja-en',
    name: elem.querySelector('.title strong')!.textContent!.trim()!
  }],
  synopses: [{
    language: 'en',
    synopsis: elem.querySelector('.pt4')!.textContent!.trim()!
  }],
  genres: [],
  releaseDates: [],
  related: [],
  episodes: [],
  recommended: [],
  tags: [],
  handles: []
})

export const searchAnime = ({ search }: { search: string }) =>
  fetch(`https://myanimelist.net/anime.php?${new URLSearchParams(`q=${search}`).toString()}&cat=anime`)
    .then(async res =>
      [
        ...new DOMParser()
          .parseFromString(await res.text(), 'text/html')
          .querySelectorAll('#content > div.js-categories-seasonal.js-block-list.list > table > tbody > tr')
      ]
        .slice(1)
        .map(getSearchCardInfo)
    )

const getTitleCardInfo = (elem: HTMLElement): TitleHandle => ({
  scheme: 'mal',
  categories,
  id: elem.querySelector<HTMLElement>('[data-anime-id]')!.dataset.animeId!,
  url: elem.querySelector<HTMLAnchorElement>('.video-info-title a:last-of-type')!.href,
  images: [{
    type: 'poster',
    size: 'medium',
    url: elem.querySelector<HTMLImageElement>('img')!.src
  }],
  names: [{
    search: true,
    language: 'ja-en',
    name: elem.querySelector('.mr4')!.textContent!.trim()
  }],
  synopses: [],
  genres: [],
  releaseDates: [],
  related: [],
  episodes:
    [...elem.querySelectorAll<HTMLAnchorElement>('.title a')]
      .map(elem => ({
        scheme: 'mal',
        categories,
        id: `${elem.href.split('/')[4]}-${elem.href.split('/')[7]}`,
        releaseDates: [],
        season: 1,
        number: Number(elem.href.split('/')[7]),
        url: elem.href,
        names: [],
        images: [],
        synopses: [],
        related: [],
        tags: [],
        releaseDate: [],
        handles: []
      })),
  recommended: [],
  tags: [],
  handles: []
})

enum MALInformation {
  TYPE = 'type',
  EPISODES = 'episodes',
  STATUS = 'status',
  AIRED = 'aired',
  PREMIERED = 'premiered',
  BROADCAST = 'broadcast',
  PRODUCERS = 'producers',
  LICENSORS = 'licensors',
  STUDIOS = 'studios',
  SOURCE = 'source',
  GENRES = 'genres',
  DURATION = 'duration',
  RATING = 'rating'
}

type Informations = {
  [key in MALInformation]: string
}

const infoMap =
  Object
    .values(MALInformation)
    .map(key => [
      key,
      `${key.charAt(0).toUpperCase()}${key.slice(1)}:`
    ])

const getSideInformations = (elem: Document): Informations =>
  Object.fromEntries(
    [...elem.querySelectorAll('.js-sns-icon-container ~ h2 ~ h2 ~ .spaceit_pad:not(.js-sns-icon-container ~ h2 ~ h2 ~ h2 ~ .spaceit_pad)')]
      .map(elem => [
        infoMap.find(([, val]) => val === elem.childNodes[1].textContent)?.[0]!,
        elem.childNodes[2].textContent?.trim().length
          ? elem.childNodes[2].textContent?.trim()!
          : elem.childNodes[3].textContent?.trim()!
      ])
      .filter(([key]) => infoMap.some(([_key]) => key === _key))
  )

const getSeriesTitleInfo = (elem: Document): EpisodeHandle => {
  const informations = getSideInformations(elem)
  const url =
    elem.querySelector<HTMLLinkElement>('head > link[rel="canonical"]')!.href ||
    elem.querySelector<HTMLLinkElement>('head > meta[property="og:url"]')!.getAttribute('content')!
  const englishTitle = elem.querySelector<HTMLAnchorElement>('.fs18.lh11')?.childNodes[2]!.textContent
  const [japaneseenTitle, japaneseTitle] =
    elem
      .querySelector<HTMLParagraphElement>('.fs18.lh11 ~ .fn-grey2')
      ?.textContent
      ?.trim()
      .slice(0, -1)
      .split('(')
      .map(str => str.trim())
    ?? []

  const dateElem = elem.querySelector<HTMLTableCellElement>('.episode-aired')
  const synopsis =
    elem
      .querySelector<HTMLDivElement>('.di-t.w100.mb8 ~ .pt8.pb8')
      ?.textContent
      ?.trim()
      .slice('Synopsis'.length)
      .trim()
      .replaceAll('\n\n\n\n', '\n\n')!

  return ({
    scheme: 'mal',
    categories,
    // categories: [
    //   Category.ANIME,
    //   ...informations.type.includes('TV') ? [Category.SHOW] : []
    // ],
    id: `${url.split('/')[4]!}-${url.split('/')[7]!}`,
    season: 1,
    number: Number(elem.querySelector<HTMLTableCellElement>('.fs18.lh11 .fw-n')?.textContent?.split('-')[0].slice(1)),
    url,
    names: [
      {
        language: 'en',
        name: englishTitle!
      },
      ...japaneseenTitle
        ? [{
          search: true,
          language: 'ja-en',
          name: japaneseenTitle
        }]
        : [],
      ...japaneseTitle
        ? [{
          language: 'ja',
          name: japaneseTitle
        }]
        : []
    ],
    images: [],
    releaseDates:
      dateElem &&
      !isNaN(Date.parse(dateElem.textContent!))
        ? [{
          language: 'ja',
          date: new Date(dateElem.textContent!)
        }]
        : [],
    synopses:
      elem.querySelector('.di-t.w100.mb8 ~ .pt8.pb8 .badresult')
        ? []
        : [{ language: 'en', synopsis }],
    handles: [],
    tags: [],
    related: []
  })
}

const getTitleEpisodesInfo = (elem: Document): EpisodeHandle[] => {
  const informations = getSideInformations(elem)
  
  const episodes =
    [...elem.querySelectorAll('.episode_list.ascend .episode-list-data')]
      .map(elem => {
        const url = elem.querySelector<HTMLAnchorElement>('.episode-title > a')!.href
        const englishTitle = elem.querySelector<HTMLAnchorElement>('.episode-title > a')!.textContent
        const [japaneseenTitle, _japaneseTitle] =
          elem
            .querySelector<HTMLSpanElement>('.episode-title > span')
            ?.textContent
            ?.split(String.fromCharCode(160))
          ?? []
        const japaneseTitle = _japaneseTitle?.slice(1, -1)
        const dateElem = elem.querySelector<HTMLTableCellElement>('.episode-aired')

        return ({
          scheme: 'mal',
          categories,
          // categories: [
          //   Category.ANIME,
          //   ...informations.type.includes('TV') ? [Category.SHOW] : []
          // ],
          id: `${url.split('/')[4]!}-${url.split('/')[7]!}`, // url.split('/')[7]!,
          season: 1,
          number: Number(elem.querySelector<HTMLTableCellElement>('.episode-number')?.textContent),
          url,
          names: [
            {
              language: 'en',
              name: englishTitle!
            },
            ...japaneseenTitle
              ? [{
                search: true,
                language: 'ja-en',
                name: japaneseenTitle
              }]
              : [],
            ...japaneseTitle
              ? [{
                language: 'ja',
                name: japaneseTitle
              }]
              : []
          ],
          images: [],
          releaseDates:
            dateElem &&
            !isNaN(Date.parse(dateElem.textContent!))
              ? [{
                language: 'ja',
                date: new Date(dateElem.textContent!)
              }]
              : [],
          synopses: [],
          handles: [],
          tags: [],
          related: []
        })
      })

  return episodes
}

const getSeriesInfo = async (elem: Document): Promise<TitleHandle> => {
  console.log('elem', elem)
  const url = getDocumentUrl(elem)

  const informations = getSideInformations(elem)
  const dateText = informations.aired

  const startDate =
    new Date(
      dateText
        .split('to')
        .at(0)!
    )

  const date: DateData =
    dateText?.includes('to')
      ? {
        language: 'ja',
        start: startDate,
        end: new Date(
          dateText
            .split('to')
            .at(1)!
        )
      }
      : {
        language: 'ja',
        date: startDate
      }

  const episodes =
    informations.episodes === 'Unknown'
      ? []
      : await (
        fetch(`${url}/episode`)
          .then(async res =>
            getTitleEpisodesInfo(
              new DOMParser()
                .parseFromString(await res.text(), 'text/html')
            )
          )
      )

  return {
    scheme: 'mal',
    categories,
    // categories: [
    //   Category.ANIME
    // ],
    id: url.split('/')[4],
    url: url,
    images: [{
      type: 'poster',
      size: 'medium',
      url: elem.querySelector<HTMLImageElement>('#content > table > tbody > tr > td.borderClass a img')!.dataset.src!
    }],
    names:
      [
        elem.querySelector('.title-name')!,
        ...elem.querySelectorAll<HTMLDivElement>('.js-sns-icon-container + br + h2 ~ div:not(.js-sns-icon-container + br + h2 ~ h2 ~ *):not(.js-alternative-titles), .js-alternative-titles > div')
      ]
        // todo: improve synonyms handling, e.g there can be multiple synonyms on the same line, separated by `,`, e.g: https://myanimelist.net/anime/5114/Fullmetal_Alchemist__Brotherhood
        // todo: also implement and give titles a lower score than the the original names
        // .flatMap((elem, i) => {
        //   if (i === 0) {
        //     return ({
        //       search: true,
        //       language: 'ja-en',
        //       name: elem?.textContent?.trim()!
        //     })
        //   }



        //   if (elem?.childNodes[1].textContent?.slice(0, -1) === 'Synonyms') {
        //     return 
        //   }

        //   return ({
        //     language:
        //       elem?.childNodes[1].textContent?.slice(0, -1) === 'Synonyms' ? 'en' :
        //       languageToTag(elem?.childNodes[1].textContent?.slice(0, -1)!.split('-').at(0)!) || elem?.childNodes[1].textContent?.slice(0, -1)!,
        //     name: elem?.childNodes[2].textContent?.trim()!
        //   })
        // }),
        .map((elem, i) =>
          i
            ? {
              language:
                elem?.childNodes[1].textContent?.slice(0, -1) === 'Synonyms' ? 'en' :
                languageToTag(elem?.childNodes[1].textContent?.slice(0, -1)!.split('-').at(0)!) || elem?.childNodes[1].textContent?.slice(0, -1)!,
              name: elem?.childNodes[2].textContent?.trim()!
            }
            : {
              search: true,
              language: 'ja-en',
              name: elem?.textContent?.trim()!
            }
        ),
    synopses: [{
      language: 'en',
      synopsis:
        elem
          .querySelector<HTMLParagraphElement>('[itemprop=description]')
          ?.textContent
          ?.replaceAll('\n\n\n\n', '\n\n')!
    }],
    genres: [],
    releaseDates: [date],
    related: [],
    episodes,
    recommended: [],
    tags: [],
    handles: []
  }
}

const getSeriesTitles = async (options: { url: string } | { id: string }) => {
  const url =
    'id' in options
      ? getDocumentUrl(await getSeriesDocument(options.id))
      : options.url

  const res = await fetch(`${url}/episode`)

  return getTitleEpisodesInfo(
    new DOMParser()
      .parseFromString(await res.text(), 'text/html')
  )
}

export const getSeriesDocument = (id: string) =>
  fetch(`https://myanimelist.net/anime/${id}`)
    .then(async res =>
      new DOMParser()
        .parseFromString(await res.text(), 'text/html')
    )

export const getSeries = (id: string) =>
  getSeriesDocument(id)
    .then(getSeriesInfo)

export const getTitle = (id: string, episode: number) =>
  fetch(`https://myanimelist.net/anime/${id}/${id}/episode/${episode}`)
    .then(async res =>
      getSeriesTitleInfo(
        new DOMParser()
          .parseFromString(await res.text(), 'text/html')
      )
    )

const getLatestEpisodes = () =>
  fetch('https://myanimelist.net/watch/episode')
    .then(async res =>
      [
        ...new DOMParser()
          .parseFromString(await res.text(), 'text/html')
          .querySelectorAll('.video-list-outer-vertical')
      ]
        .map(getTitleCardInfo)
    )

// export const getLatest: GetLatest<true> = ({ title, episode }) =>
//   title ? getAnimeSeason()
//   : episode ? getLatestEpisodes()
//   : Promise.resolve([])
// globalThis.fetch(iconUrl)
// addTarget({
//   name: 'MyAnimeList',
//   scheme: 'mal',
//   categories,
//   // icon: iconUrl,
//   getTitle: {
//     scheme: 'mal',
//     categories,
//     function: ({ uri, id }) =>
//       getAnimeTitle(id ?? fromUri(uri!).id)
//   },
//   getEpisode: {
//     scheme: 'mal',
//     categories,
//     function: ({ uri }) =>
//       getAnimeEpisode(fromUri(uri!).id.split('-')[0], Number(fromUri(uri!).id.split('-')[1]))
//   },
//   searchTitle: {
//     scheme: 'mal',
//     categories,
//     latest: true,
//     pagination: true,
//     genres: true,
//     score: true,
//     search: true,
//     function: ({ latest, search }) =>
//       latest ? getAnimeSeason()
//       : search ? searchAnime({ search })
//       : Promise.resolve([])
//   },
//   searchEpisode: {
//     scheme: 'mal',
//     categories,
//     latest: true,
//     pagination: true,
//     genres: true,
//     score: true,
//     function: async () => [] ?? getLatestEpisodes()
//   }
// })

export const test = async () => {
  const title = await getSeriesTitles({ id: (1).toString() })
  console.log('title', JSON.stringify(title, undefined, 2))
}

