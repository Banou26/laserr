// import Category from '../category'
// import { GetGenres, GenreHandle, TitleHandle, Impl } from '../types'
// import { SearchTitle, GetTitle, ReleaseDate, EpisodeHandle, GetEpisode } from '..'
import { from, Observable } from 'rxjs'
import pThrottle from 'p-throttle'


import type { TitleHandle, ImageData, FetchType, DateData, Category, SeriesHandle, SearchSeries, SearchTitles, ExtraOptions, GetSeries } from '../../../../scannarr/src'

import { fromUri, fromUris, populateUri } from '../../../../scannarr/src/utils'
import { languageToTag, LanguageTag } from '../../utils'

export const icon = 'https://cdn.myanimelist.net/images/favicon.ico'
export const origin = 'https://myanimelist.net'
export const categories: Category[] = ['ANIME']
export const name = 'MyAnimeList'
export const scheme = 'mal'

const throttle = pThrottle({
	limit: 4,
	interval: 1_000
})

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

const getSeasonCardInfo = (elem: HTMLElement): SeriesHandle => populateUri({
  averageScore:
    elem.querySelector<HTMLDivElement>('[title="Score"]')?.textContent?.trim() === 'N/A'
      ? undefined
      : Number(elem.querySelector<HTMLDivElement>('[title="Score"]')!.textContent?.trim()) / 10,
  scheme,
  categories,
  id: elem.querySelector<HTMLElement>('[id]')!.id.trim(),
  url: elem.querySelector<HTMLAnchorElement>('.link-title')!.href,
  images: [{
    type: 'poster' as const,
    size: 'medium' as const,
    url: elem.querySelector<HTMLImageElement>('img')!.src || elem.querySelector<HTMLImageElement>('img')!.dataset.src!
  }],
  names: [{
    score: 1,
    language: LanguageTag.JA,
    name: elem.querySelector('.h2_anime_title')!.textContent!.trim()!
  }],
  popularity:
    (elem.querySelector<HTMLDivElement>('[title="Members"]')?.textContent?.includes('M') ? 1_000_000
      : elem.querySelector<HTMLDivElement>('[title="Members"]')?.textContent?.includes('K') ? 1_000
      : 1)
    * Number(elem.querySelector<HTMLDivElement>('[title="Members"]')?.textContent?.trim().replace('K', '').replace('M', '')),
  synopses: [{
    language: LanguageTag.EN,
    synopsis: elem.querySelector('.preline')!.textContent!.trim()!
  }],
  genres:
    [...elem.querySelectorAll<HTMLAnchorElement>('.genre a')]
      .map(({ textContent, href, parentElement }) => populateUri({
        scheme,
        id: href!.split('/').at(5)!,
        adult: parentElement?.classList.contains('explicit'),
        url: fixOrigin(href),
        name: textContent?.trim()!,
        // categories
      })),
  dates: [{
    language: LanguageTag.EN,
    date: new Date(elem.querySelector('.prodsrc > .info > span:nth-child(1)')!.textContent!.trim())
  }],
  related: [],
  titles: [],
  recommended: [],
  tags: [],
  handles: [],
  withDetails: false
})

export const getAnimeSeason = ({ fetch }: ExtraOptions) =>
  fetch('https://myanimelist.net/anime/season')
    .then(async res =>
      [
        ...new DOMParser()
          .parseFromString(await res.text(), 'text/html')
          .querySelectorAll('.seasonal-anime.js-seasonal-anime')
      ]
        .map(getSeasonCardInfo)
    )

const getSearchCardInfo = (elem: HTMLElement): SeriesHandle => populateUri({
  scheme,
  categories,
  id: elem.querySelector<HTMLAnchorElement>('.hoverinfo_trigger.fw-b.fl-l')!.id.trim().replace('sinfo', ''),
  url: elem.querySelector<HTMLAnchorElement>('.hoverinfo_trigger.fw-b.fl-l')!.href,
  images: [{
    type: 'poster' as const,
    size: 'medium' as const,
    url: (elem.querySelector<HTMLImageElement>('.picSurround img')!.src || elem.querySelector<HTMLImageElement>('.picSurround img')!.dataset.src!).replace('r/50x70/', '')
  }],
  names: [{
    score: 1,
    language: LanguageTag.JA,
    name: elem.querySelector('.title strong')!.textContent!.trim()!
  }],
  synopses: [{
    language: LanguageTag.EN,
    synopsis: elem.querySelector('.pt4')!.textContent!.trim()!
  }],
  handles: [],
  withDetails: false
})

export const searchAnime = ({ search }: { search: string }, { fetch }: ExtraOptions) =>
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

const getTitleCardInfo = (elem: HTMLElement): SeriesHandle => populateUri({
  averageScore:
    elem.querySelector<HTMLDivElement>('[title="Score"]')?.textContent?.trim() === 'N/A'
      ? undefined
      : Number(elem.querySelector<HTMLDivElement>('[title="Score"]')!.textContent?.trim()),
  scheme,
  categories,
  id: elem.querySelector<HTMLElement>('[data-anime-id]')!.dataset.animeId!,
  url: elem.querySelector<HTMLAnchorElement>('.video-info-title a:last-of-type')!.href,
  images: [{
    type: 'poster' as const,
    size: 'medium' as const,
    url: elem.querySelector<HTMLImageElement>('img')!.src
  }],
  names: [{
    score: 1,
    language: LanguageTag.JA,
    name: elem.querySelector('.mr4')!.textContent!.trim()
  }],
  popularity:
    (elem.querySelector<HTMLDivElement>('[title="Members"]')?.textContent?.includes('M') ? 1_000_000
      : elem.querySelector<HTMLDivElement>('[title="Members"]')?.textContent?.includes('K') ? 1_000
      : 1)
    * Number(elem.querySelector<HTMLDivElement>('[title="Members"]')?.textContent?.trim().replace('K', '').replace('M', '')),
  synopses: [],
  genres: [],
  dates: [],
  related: [],
  titles:
    [...elem.querySelectorAll<HTMLAnchorElement>('.title a')]
      .map(elem => populateUri({
        scheme,
        categories,
        id: `${elem.href.split('/')[4]}-${elem.href.split('/')[7]}`,
        dates: [],
        unit: 1,
        number: Number(elem.href.split('/')[7]),
        url: elem.href,
        names: [],
        images: [],
        synopses: [],
        related: [],
        tags: [],
        releaseDate: [],
        handles: [],
        recommended: []
      })),
  recommended: [],
  tags: [],
  handles: [],
  withDetails: false
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
        infoMap.find(([, val]) => val === elem.childNodes[1]?.textContent)?.[0]!,
        elem.childNodes[2]?.textContent?.trim().length
          ? elem.childNodes[2]?.textContent?.trim()!
          : elem.childNodes[3]?.textContent?.trim()!
      ])
      .filter(([key]) => infoMap.some(([_key]) => key === _key))
  )

const getSeriesTitleInfo = (elem: Document): TitleHandle => {
  // const informations = getSideInformations(elem)
  const url =
    elem.querySelector<HTMLLinkElement>('head > link[rel="canonical"]')!.href ||
    elem.querySelector<HTMLLinkElement>('head > meta[property="og:url"]')!.getAttribute('content')!
  const englishTitle = elem.querySelector<HTMLAnchorElement>('.fs18.lh11')?.childNodes[2]!.textContent
  const [japaneseEnglishTitle, japaneseTitle] =
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

  const episodeThumbnailUrl =
    elem
      .querySelector<HTMLImageElement>('#content > table > tbody > tr > td:nth-child(2) > div.js-scrollfix-bottom-rel > div:nth-child(3) > div:nth-child(1) > table > tbody > tr:nth-child(1) > td > div.contents-video-embed > div.video-embed.clearfix > a > img')
      ?.getAttribute('data-src')

  return populateUri({
    scheme,
    categories,
    id: `${url.split('/')[4]!}-${url.split('/')[7]!}`,
    unit: 1,
    number: Number(elem.querySelector<HTMLTableCellElement>('.fs18.lh11 .fw-n')?.textContent?.split('-')[0]!.slice(1)),
    url,
    names: [
      {
        language: LanguageTag.EN,
        name: englishTitle!,
        score: 0.8
      },
      ...japaneseEnglishTitle
        ? [{
          language: LanguageTag.JA,
          name: japaneseEnglishTitle,
          score: 1
        }]
        : [],
      ...japaneseTitle
        ? [{
          language: LanguageTag.JA,
          name: japaneseTitle,
          score: 0.8
        }]
        : []
    ],
    images:
      episodeThumbnailUrl
        ? [{
          type: 'image' as const,
          size: 'small' as const,
          url: episodeThumbnailUrl
        }]
        : undefined,
    dates:
      dateElem &&
      !isNaN(Date.parse(dateElem.textContent!))
        ? [{
          language: LanguageTag.JA,
          date: new Date(dateElem.textContent!)
        }]
        : [],
    synopses:
      elem.querySelector('.di-t.w100.mb8 ~ .pt8.pb8 .badresult')
        ? []
        : [{ language: LanguageTag.EN, synopsis }],
    handles: [],
    tags: [],
    related: [],
    recommended: [],
    withDetails: true
  })
}

const getSeriesTitlesInfo = (elem: Document): TitleHandle[] => {
  // const informations = getSideInformations(elem)
  
  const episodes =
    [...elem.querySelectorAll('.episode_list[data-sort-order="ascend"] .episode-list-data')]
      .map(elem => {
        const url = elem.querySelector<HTMLAnchorElement>('.episode-title > a')!.href
        const englishTitle = elem.querySelector<HTMLAnchorElement>('.episode-title > a')!.textContent
        const [japaneseEnglishTitle, _japaneseTitle] =
          elem
            .querySelector<HTMLSpanElement>('.episode-title > span')
            ?.textContent
            ?.split(String.fromCharCode(160))
          ?? []
        const japaneseTitle = _japaneseTitle?.slice(1, -1)
        const dateElem = elem.querySelector<HTMLTableCellElement>('.episode-aired')
        const scoreElem = elem.querySelector<HTMLSpanElement>('td.episode-poll.scored > div.average > span.value')

        return ({
          averageScore: scoreElem ? (Number(scoreElem.textContent) / 5) : undefined,
          scheme,
          categories,
          id: `${url.split('/')[4]!}-${url.split('/')[7]!}`, // url.split('/')[7]!,
          unit: 1,
          number: Number(elem.querySelector<HTMLTableCellElement>('.episode-number')?.textContent),
          url,
          names: [
            {
              language: LanguageTag.EN,
              name: englishTitle!,
                score: 1
                // score: 0.8
            },
            ...japaneseEnglishTitle
              ? [{
                language: LanguageTag.JA,
                name: japaneseEnglishTitle,
                score: 0.8
                // score: 1
              }]
              : [],
            ...japaneseTitle
              ? [{
                language: LanguageTag.JA,
                name: japaneseTitle,
                score: 0.8
              }]
              : []
          ],
          dates:
            dateElem &&
            !isNaN(Date.parse(dateElem.textContent!))
              ? [{
                language: LanguageTag.JA,
                date: new Date(dateElem.textContent!)
              }]
              : [],
          withDetails: false
        })
      })
      .map(populateUri)

  return episodes
}

const getSeriesInfo = async (elem: Document): Promise<SeriesHandle> => {
  const url = getDocumentUrl(elem)

  const informations = getSideInformations(elem)
  const dateText = informations.aired

  const startDate =
    new Date(
      dateText
        .split('to')
        .at(0)!
    )

  const isAiringDate = dateText?.includes('to')
  const endDateString = dateText.split('to').at(1)

  const date: DateData =
    isAiringDate
      ? {
        language: LanguageTag.JA,
        start: startDate,
        end:
          endDateString
            ? endDateString.includes('?')
              ? undefined
              : new Date(endDateString)
            : undefined
      }
      : {
        language: LanguageTag.JA,
        date: startDate
      }

  // const titles =
  //   informations.episodes === 'Unknown'
  //     ? []
  //     : await (
  //       fetch(`${url}/episode`)
  //         .then(async res =>
  //           getSeriesTitlesInfo(
  //             new DOMParser()
  //               .parseFromString(await res.text(), 'text/html')
  //           )
  //         )
  //     )

  return populateUri({
    // todo: infer airingSchedule from "Broadcast: Wednesdays at 23:00 (JST)" data on the side data
    averageScore:
      elem.querySelector<HTMLDivElement>('.score .score-label')?.textContent?.trim() === 'N/A'
      ? undefined
      : Number(elem.querySelector<HTMLDivElement>('.score .score-label')!.textContent?.trim()) / 10,
    scheme,
    categories,
    id: url.split('/')[4]!,
    url: url,
    images: [{
      type: 'poster' as const,
      size: 'medium' as const,
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
        //       score: 1,
        //       language: LanguageTag.JA,
        //       name: elem?.textContent?.trim()!
        //     })
        //   }



        //   if (elem?.childNodes[1].textContent?.slice(0, -1) === 'Synonyms') {
        //     return 
        //   }

        //   return ({
        //     language:
        //       elem?.childNodes[1].textContent?.slice(0, -1) === 'Synonyms' ? LanguageTag.EN :
        //       languageToTag(elem?.childNodes[1].textContent?.slice(0, -1)!.split('-').at(0)!) || elem?.childNodes[1].textContent?.slice(0, -1)!,
        //     name: elem?.childNodes[2].textContent?.trim()!
        //   })
        // }),
        .map((elem, i) =>
          i
            ? {
              language:
                elem?.childNodes[1]?.textContent?.slice(0, -1) === 'Synonyms' ? LanguageTag.EN :
                languageToTag(elem?.childNodes[1]?.textContent?.slice(0, -1)!.split('-').at(0)!) || elem?.childNodes[1]?.textContent?.slice(0, -1)!,
              name: elem?.childNodes[2]?.textContent?.trim()!,
              score: 0.8
            }
            : {
              score: 1,
              language: LanguageTag.JA,
              name: elem?.textContent?.trim()!
            }
        ),
    synopses: [{
      language: LanguageTag.EN,
      synopsis:
        elem
          .querySelector<HTMLParagraphElement>('[itemprop=description]')
          ?.textContent
          ?.replaceAll('\n\n\n\n', '\n\n')!
    }],
    dates: [date],
    handles: [],
    withDetails: true
  })
}

export const getSeriesDocument = (options: { url: string } | { id: string }, { fetch }: ExtraOptions) =>
  fetch(
    'id' in options
      ? `https://myanimelist.net/anime/${options.id}`
      : options.url
  )
    .then(async res =>
      new DOMParser()
        .parseFromString(await res.text(), 'text/html')
    )

const getSeriesTitles = async (options: { url: string } | { id: string }, { fetch, ...extraOptions }: ExtraOptions) => {
  const url =
    'id' in options
      ? getDocumentUrl(await getSeriesDocument(options, { fetch, ...extraOptions }))
      : options.url

  const res = await fetch(`${url}/episode`)

  return getSeriesTitlesInfo(
    new DOMParser()
      .parseFromString(await res.text(), 'text/html')
  )
}

export const getSeries: GetSeries = (options, { fetch, ...extraOptions }: ExtraOptions) => {
  const throttledFetch: FetchType = throttle((...args) => fetch(...args))
  return (
    from(
      getSeriesDocument({ id: fromUris(options.uri, 'mal').id }, { ...extraOptions, fetch: throttledFetch })
        .then(getSeriesInfo)
    )
  )
}

export const getSeriesTitle = (seriesId: string, titleId: number, { fetch }: ExtraOptions) =>
  fetch(`https://myanimelist.net/anime/${seriesId}/${seriesId}/episode/${titleId}`)
    .then(async res =>
      getSeriesTitleInfo(
        new DOMParser()
          .parseFromString(await res.text(), 'text/html')
      )
    )

const getLatestTitles = ({ fetch }: ExtraOptions) =>
  fetch('https://myanimelist.net/watch/episode')
    .then(async res =>
      [
        ...new DOMParser()
          .parseFromString(await res.text(), 'text/html')
          .querySelectorAll('.video-list-outer-vertical')
      ]
        .map(getTitleCardInfo)
    )

export const searchSeries: SearchSeries = ({ ...rest }, { fetch, ...extraOptions }) => {
  const throttledFetch: FetchType = throttle((...args) => fetch(...args))
  return (
    'latest' in rest && rest.latest ? from(getAnimeSeason({ ...extraOptions, fetch: throttledFetch }))
    : 'search' in rest && typeof rest.search === 'string' ? from(searchAnime({ search: rest.search }, { ...extraOptions, fetch: throttledFetch }))
    : from([])
  )
}

export const searchTitles: SearchTitles = (options, { fetch, ...extraOptions }) => {
  const throttledFetch: FetchType = throttle((...args) => fetch(...args))
  if ('series' in options && options.series) {
    const id =
      options
        .series
        .uris
        .map(fromUri)
        .find(({ scheme }) => scheme === 'mal')
        ?.id
    if (!id) return from([])

    if ('search' in options && options.search) {
      const { search } = options
      if (typeof search === 'string') return from([])
      return from(Promise.all([getSeriesTitle(id, search.number, { ...extraOptions, fetch: throttledFetch })]))
    }
    return from(getSeriesTitles({ id }, { ...extraOptions, fetch: throttledFetch }))
  }
  return from([])
}

// todo: maybe refactor this into an async iterator to better handle paginations
const testSeriesTitles = async (limitedFetch) => {
  const { expect } = await import('epk')
  const titles = await getSeriesTitles({ id: '1' }, { fetch: limitedFetch })
  expect(titles).lengthOf(26)
  const firstTitle = titles.at(0)
  const firstTitleJSON = JSON.parse(JSON.stringify(firstTitle))
  expect(firstTitleJSON).to.deep.equal({
    scheme,
    categories: ['ANIME'],
    id: '1-1',
    unit: 1,
    number: 1,
    url: 'https://myanimelist.net/anime/1/Cowboy_Bebop/episode/1',
    names: [
      {
        language: 'en',
        name: 'Asteroid Blues',
        score: 1
      },
      {
        language: 'ja',
        name: 'Asteroid Blues',
        score: 0.8
      },
      {
        language: 'ja',
        name: 'アステロイド・ブルース',
        score: 0.8
      }
    ],
    images: [],
    dates: [
      {
        language: 'ja',
        date: '1998-10-24T04:00:00.000Z'
      }
    ],
    synopses: [],
    handles: [],
    tags: [],
    related: [],
    uri: 'mal:1-1',
    withDetails: false
  })
}

const testSeriesTitle = async (limitedFetch) => {
  const { expect } = await import('epk')
  const title = await getSeriesTitle('1', 1, { fetch: limitedFetch })
  const titleJSON = JSON.parse(JSON.stringify(title))
  expect(titleJSON).to.deep.equal({
    scheme,
    categories: ['ANIME'],
    id: '1-1',
    unit: 1,
    number: 1,
    url: 'https://myanimelist.net/anime/1/Cowboy_Bebop/episode/1',
    names: [{
      language: 'en',
      name: 'Asteroid Blues',
      score: 1
    }, {
      language: 'ja',
      name: 'Asteroid Blues',
      score: 0.8
    }, {
      language: 'ja',
      name: 'アステロイド・ブルース',
      score: 0.8
    }],
    images: [],
    dates: [],
    synopses: [{
      language: 'en',
      synopsis: `In a flashback, Spike Spiegel is shown waiting near a church holding a bouquet of flowers, before leaving as the church bell rings. As he walks away, images of a gunfight he participated in are shown. In the present, Spike, currently a bounty hunter, and his partner Jet Black head to the Tijuana asteroid colony on their ship, the Bebop, to track down a bounty-head named Asimov Solensan. Asimov is wanted for killing members of his own crime syndicate and for stealing a cache of a dangerous combat drug known as Bloody-Eye. On the colony, Asimov and his girlfriend, Katerina, are ambushed at a bar by his former syndicate while attempting to sell a vial of Bloody-Eye, but Asimov manages to fight his way out by using the drug himself. Spike later encounters Katerina and reveals to her that he is a bounty hunter searching for Asimov; Spike is promptly assaulted by Asimov and is nearly killed before Katerina intervenes. In the confusion, Spike is able to steal Asimov's Bloody-Eye vial before the two leave. Spike later confronts Asimov at a staged drug deal with the stolen vial, but Asimov escapes with Katerina in a ship when the two are interrupted by an attack from Asimov's former syndicate. With Spike giving chase in his own ship, Asimov attempts to take another dose of Bloody-Eye, but a horrified Katerina shoots him before he can. As Spike approaches Asimov's ship, it is destroyed by attacking police cruisers, forcing Spike to pull away. The episode ends with Spike and Jet once again traveling through space on the Bebop.

(Source: Wikipedia)`
    }],
    handles: [],
    tags: [],
    related: [],
    uri: 'mal:1-1',
    withDetails: true
  })
}

const testSeries = async (limitedFetch) => {
  const { expect } = await import('epk')
  const series = await getSeries({ id: '1' }, { fetch: limitedFetch })
  const seriesJSON = JSON.parse(JSON.stringify(series))
  expect(seriesJSON).to.deep.equal({
    scheme,
    categories: ['ANIME'],
    id: '1',
    url: 'https://myanimelist.net/anime/1/Cowboy_Bebop',
    images: [{
      type: 'poster',
      size: 'medium',
      url: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg'
    }],
    names: [
      {
        score: 1,
        language: 'ja',
        name: 'Cowboy Bebop'
      },
      {
        language: 'ja',
        name: 'カウボーイビバップ',
        score: 0.8
      },
      {
        language: 'en',
        name: 'Cowboy Bebop',
        score: 0.8
      }
    ],
    synopses: [{
      language: 'en',
      synopsis: `Crime is timeless. By the year 2071, humanity has expanded across the galaxy, filling the surface of other planets with settlements like those on Earth. These new societies are plagued by murder, drug use, and theft, and intergalactic outlaws are hunted by a growing number of tough bounty hunters.

Spike Spiegel and Jet Black pursue criminals throughout space to make a humble living. Beneath his goofy and aloof demeanor, Spike is haunted by the weight of his violent past. Meanwhile, Jet manages his own troubled memories while taking care of Spike and the Bebop, their ship. The duo is joined by the beautiful con artist Faye Valentine, odd child Edward Wong Hau Pepelu Tivrusky IV, and Ein, a bioengineered Welsh Corgi.

While developing bonds and working to catch a colorful cast of criminals, the Bebop crew's lives are disrupted by a menace from Spike's past. As a rival's maniacal plot continues to unravel, Spike must choose between life with his newfound family or revenge for his old wounds.

[Written by MAL Rewrite]
`
    }],
    genres: [],
    dates: [{
      language: 'ja',
      start: '1998-04-03T05:00:00.000Z',
      end: '1999-04-24T04:00:00.000Z'
    }],
    related: [],
    titles: [],
    recommended: [],
    tags: [],
    handles: [],
    uri: 'mal:1',
    withDetails: true
  })
}

export const test = async () => {
  const throttledFetch: FetchType = throttle((...args) => fetch(...args))

  await Promise.all([
    testSeriesTitles(throttledFetch),
    testSeries(throttledFetch),
    testSeriesTitle(throttledFetch)
  ])
  // await new Promise(resolve => setTimeout(resolve, 10000000))
}

// export const getLatest: GetLatest<true> = ({ title, episode }) =>
//   title ? getAnimeSeason()
//   : episode ? getLatestEpisodes()
//   : Promise.resolve([])
// globalThis.fetch(iconUrl)
// addTarget({
//   name: 'MyAnimeList',
//   scheme,
//   categories,
//   // icon: iconUrl,
//   getTitle: {
//     scheme,
//     categories,
//     function: ({ uri, id }) =>
//       getAnimeTitle(id ?? fromUri(uri!).id)
//   },
//   getEpisode: {
//     scheme,
//     categories,
//     function: ({ uri }) =>
//       getAnimeEpisode(fromUri(uri!).id.split('-')[0], Number(fromUri(uri!).id.split('-')[1]))
//   },
//   searchTitle: {
//     scheme,
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
//     scheme,
//     categories,
//     latest: true,
//     pagination: true,
//     genres: true,
//     score: true,
//     function: async () => [] ?? getLatestEpisodes()
//   }
// })
