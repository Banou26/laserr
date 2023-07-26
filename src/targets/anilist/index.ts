import type { Category, ExtraOptions, GetSeries, Media, Resolvers, SearchSeries, SeriesHandle } from 'scannarr'
import { MediaSeason, MediaFormat, Media as AnilistMedia, MediaExternalLink, MediaStatus, PageInfo, Page } from './types'

import { from, combineLatest, startWith, map, tap } from 'rxjs'
import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'

import { fromUri, fromUris, populateUri } from 'scannarr'
import { LanguageTag } from '../../utils'
import { AiringSchedule } from './types'
import pThrottle from 'p-throttle'
import { MediaParams, NoExtraProperties } from '../../utils/type'
import { HandleRelation } from 'scannarr'
import { toUri } from 'scannarr'

const throttle = pThrottle({
	limit: 2,
	interval: 1_000
})

export const icon = 'https://anilist.co/img/icons/favicon-32x32.png'
export const originUrl = 'https://anilist.co'
export const categories: Category[] = ['ANIME']
export const name = 'Anilist'
export const origin = 'anilist'
export const official = true
export const metadataOnly = true

const searchQuery = `
query (
  $season: MediaSeason
  $year: Int
  $format: MediaFormat
  $excludeFormat: MediaFormat
  $status: MediaStatus
  $minEpisodes: Int
  $page: Int
  $idMal: Int
  $id: Int
  $type: MediaType
) {
  Page(page: $page) {
    pageInfo {
      hasNextPage
      total
    }
    media(
      season: $season
      seasonYear: $year
      format: $format
      format_not: $excludeFormat
      status: $status
      episodes_greater: $minEpisodes
      isAdult: false
      sort: TITLE_ROMAJI
      idMal: $idMal
      id: $id
      type: $type
    ) {
      id
      idMal
      title {
        romaji
        native
        english
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      status
      season
      format
      type
      genres
      synonyms
      duration
      popularity
      episodes
      source(version: 2)
      countryOfOrigin
      hashtag
      averageScore
      siteUrl
      description
      bannerImage
      isAdult
      coverImage {
        extraLarge
        color
      }
      trailer {
        id
        site
        thumbnail
      }
      externalLinks {
        site
        url
      }
      rankings {
        rank
        type
        season
        allTime
      }
      studios(isMain: true) {
        nodes {
          id
          name
          siteUrl
        }
      }
      relations {
        edges {
          relationType(version: 2)
          node {
            id
            title {
              romaji
              native
              english
            }
            siteUrl
          }
        }
      }

      airingSchedule(perPage: 25) {
        nodes {
          episode
          airingAt
        }
      }
    }
  }
}
`

const GET_MEDIA = `
query GetMedia ($id: Int, $idMal: Int, $type: MediaType) {
  Media(idMal: $idMal, id: $id, type: $type) {
    id
    idMal
    title {
      romaji
      native
      english
    }
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    status
    season
    format
    type
    genres
    synonyms
    duration
    popularity
    episodes
    source(version: 2)
    countryOfOrigin
    hashtag
    averageScore
    siteUrl
    description
    bannerImage
    isAdult
    coverImage {
      extraLarge
      color
    }
    trailer {
      id
      site
      thumbnail
    }
    externalLinks {
      site
      url
    }
    rankings {
      rank
      type
      season
      allTime
    }
    studios(isMain: true) {
      nodes {
        id
        name
        siteUrl
      }
    }
    relations {
      edges {
        relationType(version: 2)
        node {
          id
          title {
            romaji
            native
            english
          }
          siteUrl
        }
      }
    }
    airingSchedule {
      edges {
        node {
          airingAt
          episode
          id
          media {
            id
            idMal
          }
          mediaId
          timeUntilAiring
        }
      }
    }
  }
}
`

// notYetAired: true
// perPage: 2

const seasonVariables = {season: "SUMMER", year: 2022, format: "TV", page: 1}
const seasonVariables2 = {season: "SUMMER", year: 2022, excludeFormat: "TV", page: 1}
const seasonVariables3 = {season: "SPRING", year: 2022, minEpisodes: 16, page: 1}

// fetch("https://graphql.anilist.co/", {
//   "headers": {
//     "content-type": "application/json"
//   },
//   "referrer": "https://anichart.net/",
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": "{\"query\":\"query (\\n\\t$season: MediaSeason,\\n\\t$year: Int,\\n\\t$format: MediaFormat,\\n\\t$excludeFormat: MediaFormat,\\n\\t$status: MediaStatus,\\n\\t$minEpisodes: Int,\\n\\t$page: Int,\\n){\\n\\tPage(page: $page) {\\n\\t\\tpageInfo {\\n\\t\\t\\thasNextPage\\n\\t\\t\\ttotal\\n\\t\\t}\\n\\t\\tmedia(\\n\\t\\t\\tseason: $season\\n\\t\\t\\tseasonYear: $year\\n\\t\\t\\tformat: $format,\\n\\t\\t\\tformat_not: $excludeFormat,\\n\\t\\t\\tstatus: $status,\\n\\t\\t\\tepisodes_greater: $minEpisodes,\\n\\t\\t\\tisAdult: false,\\n\\t\\t\\ttype: ANIME,\\n\\t\\t\\tsort: TITLE_ROMAJI,\\n\\t\\t) {\\n\\t\\t\\t\\nid\\nidMal\\ntitle {\\n\\tromaji\\n\\tnative\\n\\tenglish\\n}\\nstartDate {\\n\\tyear\\n\\tmonth\\n\\tday\\n}\\nendDate {\\n\\tyear\\n\\tmonth\\n\\tday\\n}\\nstatus\\nseason\\nformat\\ngenres\\nsynonyms\\nduration\\npopularity\\nepisodes\\nsource(version: 2)\\ncountryOfOrigin\\nhashtag\\naverageScore\\nsiteUrl\\ndescription\\nbannerImage\\nisAdult\\ncoverImage {\\n\\textraLarge\\n\\tcolor\\n}\\ntrailer {\\n\\tid\\n\\tsite\\n\\tthumbnail\\n}\\nexternalLinks {\\n\\tsite\\n\\turl\\n}\\nrankings {\\n\\trank\\n\\ttype\\n\\tseason\\n\\tallTime\\n}\\nstudios(isMain: true) {\\n\\tnodes {\\n\\t\\tid\\n\\t\\tname\\n\\t\\tsiteUrl\\n\\t}\\n}\\nrelations {\\n\\tedges {\\n\\t\\trelationType(version: 2)\\n\\t\\tnode {\\n\\t\\t\\tid\\n\\t\\t\\ttitle {\\n\\t\\t\\t\\tromaji\\n\\t\\t\\t\\tnative\\n\\t\\t\\t\\tenglish\\n\\t\\t\\t}\\n\\t\\t\\tsiteUrl\\n\\t\\t}\\n\\t}\\n}\\n\\nairingSchedule(\\n\\tnotYetAired: true\\n\\tperPage: 2\\n) {\\n\\tnodes {\\n\\t\\tepisode\\n\\t\\tairingAt\\n\\t}\\n}\\n\\n\\t\\t}\\n\\t}\\n}\",\"variables\":{\"season\":\"SUMMER\",\"year\":2022,\"excludeFormat\":\"TV\",\"page\":1}}",
//   "method": "POST",
//   "mode": "cors",
//   "credentials": "omit"
// });

const fetchMediaSeason = throttle((
  { season, year, excludeFormat, minEpisodes, status, page = 1 }:
  { season: MediaSeason, year: number, excludeFormat?: MediaFormat, minEpisodes?: number, status?: MediaStatus, page?: number }
) =>
  fetch('https://graphql.anilist.co/', {
    method: 'POST',
    "headers": {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: searchQuery,
      variables: {
        status,
        season,
        year,
        excludeFormat,
        minEpisodes,
        page,
        type: 'ANIME'
      }
    })
  })
)

const fetchFullMediaSeasonMedias = (
  { season, year, excludeFormat, minEpisodes, status }: { season: MediaSeason, year: number, excludeFormat?: MediaFormat, minEpisodes?: number, status?: MediaStatus },
  page = 1
): Promise<AnilistMedia[]> =>
  fetchMediaSeason({ season, year, excludeFormat, minEpisodes, status, page })
    .then(response => response.json())
    .then(async json => {
      const info: PageInfo = json.data.Page.pageInfo
      const medias: AnilistMedia[] = json.data.Page.media
      if (info.hasNextPage) {
        const nextPagesMedias = await fetchFullMediaSeasonMedias({ season, year, excludeFormat, minEpisodes, status }, page + 1)
        return [
          ...medias,
          ...nextPagesMedias
        ]
      }
      return medias
    })

const fetchMedia = throttle(({ id }: { id: number }) =>
  fetch('https://graphql.anilist.co/', {
    method: 'POST',
    "headers": {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: GET_MEDIA,
      variables: {
        id,
        type: 'ANIME'
      }
    })
  })
    .then(response => response.json())
    .then(json =>
        json.data.Media
          ? anilistMediaToScannarrMedia(json.data.Media)
          : undefined
      )
)

const fetchSeries = throttle(({ id, malId }: { id?: number, malId?: number }) =>
  fetch('https://graphql.anilist.co/', {
    method: 'POST',
    "headers": {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: searchQuery,
      variables: {
        id,
        malId
      }
    })
  })
)

type SeasonObject = {
  season: MediaSeason
  year: number
}

// from https://anichart.net/js/app.b1e2a7ec.js:401
// , c = function() {
//   let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
//     , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : new Date;
//   if ("function" !== typeof e.getMonth)
//       throw new Error("Invalid Date Object");
//   if (t > 12 || t < -12)
//       throw new Error("getSeason does not support offset months greater than 12");
//   let i = e.getFullYear()
//     , a = e.getMonth() + t;
//   a >= 12 ? (a %= 12,
//   i += 1) : a < 0 && (a += 12,
//   i -= 1);
//   const r = [{
//       season: "winter",
//       range: [0, 2]
//   }, {
//       season: "spring",
//       range: [3, 5]
//   }, {
//       season: "summer",
//       range: [6, 8]
//   }, {
//       season: "fall",
//       range: [9, 11]
//   }]
//     , n = r.find(t=>{
//       let e = t.range;
//       return a >= e[0] && a <= e[1]
//   }
//   )
//     , s = n.season;
//   return {
//       season: s,
//       year: i
//   }
// }
export const getCurrentSeason = (offset = 0, date = new Date()): SeasonObject => {
  if (offset > 12 || offset < -12) throw new Error("Anilist getCurrentSeason does not support offset months greater than 12")
  let currentYear = date.getFullYear()
  let currentMonth = date.getMonth() + offset

  if (currentMonth >= 12) {
    currentMonth %= 12
    currentYear += 1
  } else if (currentMonth < 0) {
    currentMonth += 12
    currentYear -= 1
  }

  const seasons = [{
    season: "winter",
    range: [0, 2]
  }, {
    season: "spring",
    range: [3, 5]
  }, {
    season: "summer",
    range: [6, 8]
  }, {
    season: "fall",
    range: [9, 11]
  }] as const
  const currentSeason = seasons.find(t =>{
    let e = t.range;
    return currentMonth >= e[0] && currentMonth <= e[1]
  })!
  const seasonName = currentSeason.season;
  return {
    season: seasonName.toUpperCase() as MediaSeason,
    year: currentYear
  }
}

const getDateSeason = (date: Date) => {
  const month = date.getMonth()
  return (
    month >= 0 && month <= 2 ? "WINTER"
    : month >= 3 && month <= 5 ? "SPRING"
    : month >= 6 && month <= 8 ? "SUMMER"
    : month >= 9 && month <= 11 && "FALL"
  )
}

const getDateSeasonObject = (date: Date) => ({
  season: getDateSeason(date),
  year: date.getFullYear()
})

// from https://anichart.net/0bfe19ab50401093b305.worker.js:969
// function nt(t) {
//   let e = t.season
//     , n = t.year;
//   const r = ["winter", "spring", "summer", "fall"];
//   if ("winter" === e.toLowerCase())
//       return {
//           season: "fall",
//           year: n - 1
//       };
//   const o = r[r.indexOf(e.toLowerCase()) - 1];
//   return {
//       season: o
//   }
// }
const getPreviousSeason = (seasonObject: SeasonObject): SeasonObject => {
  const seasonName = seasonObject.season.toLowerCase()
  const year = seasonObject.year
  const seasons = ['winter', 'spring', 'summer', 'fall']
  if ('winter' === seasonName) {
    return {
      season: 'fall'.toUpperCase() as MediaSeason,
      year: year - 1
    }
  }
  const previousSeason = seasons[seasons.indexOf(seasonName) - 1]!
  return {
    season: previousSeason.toUpperCase() as MediaSeason,
    year
  }
}

const fetchSeason = () => {

}

const mediaToSeriesHandle = (media: AnilistMedia): Media => ({
  averageScore:
    media.averageScore
      ? media.averageScore / 100
      : undefined,
  episodes:
    media.airingSchedule?.nodes
      ? media.airingSchedule.nodes?.map((airingSchedule: AiringSchedule) => ({
        date: new Date(airingSchedule.airingAt * 1000),
        number: airingSchedule.episode
      }))
      : undefined,
  startDate: media.startDate,
  endDate: media.endDate,
  episodeCount: media.episodes,
  categories,
  ...populateUri({
    origin,
    id: media.id.toString(),
    url: media.siteUrl ?? undefined,
    handles: {
      edges: []
    }
  }),
  genres:
    media.genres?.length
      ? (
        media.genres.map((genre: string) => populateUri({
          origin,
          id: genre,
          url: `https://anilist.co/search/anime?genres=${genre}`,
          name: genre,
          handles: {
            edges: []
          }
        }))
      )
      : undefined,
  names:
    Object
    .entries(media.title ?? {})
    .filter(([, name]) => name)
    .map(([language, name]) => ({
      name: name!,
      language:
        language === 'english' ? LanguageTag.EN
        : language === 'romaji' ? LanguageTag.JA
        // language === 'native'
        : LanguageTag.JA,
      score:
        language === 'romaji' ? 1
        : language === 'english' ? 0.8
        // language === 'native'
        : 0.6
    })),
  externalLinks:
    media.externalLinks
      ? (
        media.externalLinks.map((externalLink: MediaExternalLink) => ({
          url: externalLink.url,
          site: externalLink.site,
          type: externalLink.type,
          language: externalLink.language
        }))
      )
      : undefined,
  dates:
    media.startDate?.year
      ? [{
        language: 'jp',
        start: new Date(media.startDate?.year, media.startDate?.month!, media.startDate?.day ?? undefined),
        end:
          media.endDate?.year
            ? new Date(media.endDate?.year, media.endDate?.month!, media.endDate?.day ?? undefined)
            : undefined
      }]
      : undefined,
  handles: {
    edges:
      media.idMal ? [{
        node: populateUri({
          id: media.idMal.toString(),
          origin: 'mal',
          handles: {
            edges: []
          }
        }),
        handleRelationType: HandleRelation.Identical
      }] : []
  },
  images: [
    ...media.coverImage ? [{
      type: 'poster' as const,
      size:
        media.coverImage.extraLarge ? 'large' as const
        : media.coverImage.large ? 'medium' as const
        // media.coverImage.medium
        : 'small' as const,
      url:
        (media.coverImage.extraLarge
        ?? media.coverImage.large
        ?? media.coverImage.medium)!
    }] : [],
    ...media.bannerImage ? [{
      type: 'image' as const,
      size: 'large' as const,
      url: media.bannerImage!
    }] : [],
  ],
  popularity: media.popularity ?? undefined,
  status: media.status ?? undefined,
  synopses:
    media.description
      ? [{
        language: 'en',
        synopsis: media.description
      }]
      : undefined,
  withDetails: false
}) as SeriesHandle

// todo: add support for multiple graphql response pages
const getSeason = (
  { season, year, excludeFormat, minEpisodes, status }: { season: MediaSeason, year: number, excludeFormat?: MediaFormat, minEpisodes?: number, status?: MediaStatus },
): Promise<SeriesHandle[]> =>
  fetchFullMediaSeasonMedias({ season, year, excludeFormat, minEpisodes, status }, 1)
    // .then(res => console.log('res', res) || res)
    .then(medias => medias.map(mediaToSeriesHandle))

// todo: improve the previousSeason query
export const searchSeries: SearchSeries = ({ ...rest }) => {
  const throttledFetch: ExtraOptions['fetch'] = throttle((input: RequestInfo | URL, init?: RequestInit | undefined) => fetch(input, { ...init, noProxy: true }))

  if ('latest' in rest && rest.latest) {
    const { season, year } = getCurrentSeason(1)
    const { season: previousSeason, year: previousSeasonYear } = getPreviousSeason({ season, year })
    const result = getSeason({ season, year }, { ...extraOptions, fetch: throttledFetch })
    const leftOvers = getSeason({ season: previousSeason, year: previousSeasonYear, status: MediaStatus.Releasing }, { ...extraOptions, fetch: throttledFetch })
    return combineLatest([
      from(result),
      from(leftOvers)
        .pipe(
          map(handles =>
            handles
              // .filter(handle => handle.status === 'RELEASING')
          )
        )
    ]).pipe(
      startWith([]),
      map(seriesHandles =>
          pipe(
            seriesHandles.flat(),
            A.uniq(EqByUri),
          ) as SeriesHandle[]
      ),
      // tap(val => console.log('val', val))
    )
  }

  return from([])
}

const getIdFromUrl = (url: string): number => 1

// export const getSeries: GetSeries = (options: { url: string } | { id: string }: ExtraOptions) =>
//   fetchSeries({ id: 'url' in options ? getIdFromUrl(options.url) : Number(options.id) })
//     .then(response => response.json())
//     .then(json => {
//       const medias: Media[] = json.data.Page.media
//       return medias.map(mediaToSeriesHandle)
//     })


export const getSeries: GetSeries = (options) => {
  const throttledFetch: ExtraOptions['fetch'] = throttle((input: RequestInfo | URL, init?: RequestInit | undefined) => fetch(input, { ...init, noProxy: true }))
  // console.log('id', fromUris(options.uri, 'anilist').id)
  return (
    
    from(
      fetchSeries({ id: 'uri' in options ? fromUris(options.uri, 'anilist').id : options.id }, { ...extraOptions, fetch: throttledFetch })
        .then(response => response.json())
        .then(json => {
          const medias: AnilistMedia[] = json.data.Page.media
          const series = medias.map(mediaToSeriesHandle).at(0)
          if (!series) throw new Error(`Anilist getSeries '${'uri' in options ? options.uri : options.id}' not found`)
          return series
        })
    )
  
  )
}

const anilistMediaToScannarrMedia = (media: AnilistMedia): NoExtraProperties<Media> => ({
  ...populateUri({
    origin,
    id: media.id.toString(),
    url: media.siteUrl,
    handles: {
      edges:
        media.idMal
          ? [{
            node: populateUri({
              origin: 'mal',
              id: media.idMal.toString(),
              url: `https://myanimelist.net/anime/${media.idMal}`,
              handles: { edges: [] }
            }),
            handleRelationType: HandleRelation.Identical
          }]
          : []
    }
  }),
  averageScore:
    media.averageScore
      ? media.averageScore / 100
      : undefined,
  coverImage: [{
    extraLarge: media.coverImage?.extraLarge,
    large: media.coverImage?.large,
    medium: media.coverImage?.medium,
    color: media.coverImage?.color
  }],
  trailers:
    media.trailer?.site === 'youtube'
      ? [{
        ...populateUri({
          origin: 'yt',
          id: media.trailer.id?.toString(),
          url: `https://www.youtube.com/watch?v=${media.trailer.id}`,
          handles: { edges: [] }
        }),
        thumbnail: media.trailer!.thumbnail
      }]
      : undefined,
  description: media.description,
  title: {
    romanized: media.title?.romaji,
    native: media.title?.native,
    english: media.title?.english
  },
  startDate: media.startDate,
  endDate: media.endDate,
  popularity: media.popularity,
  episodeCount: media.episodes,
  episodes: {
    edges: media.airingSchedule?.edges?.filter(Boolean).map(edge => edge?.node && ({
      node: {
        ...populateUri({
          origin,
          id: `${edge.node.id.toString()}-${edge.node.episode}`,
          url: `https://anilist.co/anime/${media.id}`,
          handles: {
            edges: []
          }
        }),
        airingAt: edge.node.airingAt,
        number: edge.node.episode,
        media: edge.node.media && anilistMediaToScannarrMedia(edge.node.media),
        mediaUri: toUri({ origin, id: edge.node?.media?.id.toString() }),
        timeUntilAiring: edge.node.timeUntilAiring,
      }
    }))
  }
})

export const getAnimeSeason = (_, { season, seasonYear }: MediaParams[1], __, ___) => {
  if (!seasonYear) throw new Error('Anilist getAnimeSeason `seasonYear` is required')

  const res = fetchFullMediaSeasonMedias({ season: season, year: seasonYear }, 1)
    // .then(res => void console.log('res', res) || res)
    .then(medias => medias.map(anilistMediaToScannarrMedia))

  // console.log('res2', res)
  return res
}

export const resolvers: Resolvers = {
  Page: {
    media: async (...args) => {
      // console.log('Anilist Page media', args)
      const [, { search, season }] = args
      return (
        season ? getAnimeSeason(...args) :
        []
      )
    }
  },
  Query: {
    // todo: potentially add query to return data for MAL uris
    Media: async (...args) => {
      const [_, { id, uri, origin: _origin }] = args
      if (_origin !== origin) return undefined
      // console.log('args', args)
      // const malId = fromUri(uri)
      const res = await fetchMedia({ id: Number(id) })
      // console.log('Anilist Media', res)
      return res
    },
    Page: () => ({})
  }
}
