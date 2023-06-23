import { HandleRelation, Media, Resolvers } from 'scannarr'

import type { MediaParams, NoExtraProperties } from '../../utils/type'

import { MediaStatus, populateUri, toUri } from 'scannarr'
import pThrottle from 'p-throttle'
import { MediaEpisode } from 'scannarr'
import { origin as crynchyrollOrigin } from '../crunchyroll/crunchyroll-beta'
import { gql } from '../../generated'

// https://jikan.moe/

export const icon = 'https://cdn.myanimelist.net/images/favicon.ico'
export const originUrl = 'https://myanimelist.net'
export const origin = 'mal'
export const categories = ['ANIME']
export const name = 'MyAnimeList'
export const official = true
export const metadataOnly = true

// https://docs.api.jikan.moe/#section/Information/Rate-Limiting is wrong
const throttleSec = pThrottle({
	limit: 3,
  strict: true,
	interval: 3000
})

const throttleMin = pThrottle({
	limit: 60,
  strict: true,
	interval: 60_000
})

const throttle = (func: (...args: any[]) => any) => throttleSec(throttleMin(func))

export interface Root {
  pagination: Pagination
  data: AnimeResponse[]
}

export interface Pagination {
  last_visible_page: number
  has_next_page: boolean
  current_page: number
  items: Items
}

export interface Items {
  count: number
  total: number
  per_page: number
}

export interface Episode {
  mal_id: number
  url: string
  title: string
  title_japanese: string
  title_romanji: string
  aired: string
  score: number
  filler: boolean
  recap: boolean
  forum_url: string
}

export interface AnimeResponse {
  mal_id: number
  url: string
  images: Images
  trailer: Trailer
  approved: boolean
  titles: Title[]
  title: string
  title_english?: string
  title_japanese: string
  title_synonyms: string[]
  type: string
  source: string
  episodes?: number
  status: string
  airing: boolean
  aired: Aired
  duration: string
  rating?: string
  score?: number
  scored_by?: number
  rank?: number
  popularity: number
  members: number
  favorites: number
  synopsis: string
  background: any
  season: string
  year: number
  broadcast: Broadcast
  producers: Producer[]
  licensors: Licensor[]
  studios: Studio[]
  genres: Genre[]
  explicit_genres: any[]
  themes: Theme[]
  demographics: Demographic[]
}

export interface Images {
  jpg: Jpg
  webp: Webp
}

export interface Jpg {
  image_url: string
  small_image_url: string
  large_image_url: string
}

export interface Webp {
  image_url: string
  small_image_url: string
  large_image_url: string
}

export interface Trailer {
  youtube_id: string
  url: string
  embed_url: string
  images: Images2
}

export interface Images2 {
  image_url: string
  small_image_url: string
  medium_image_url: string
  large_image_url: string
  maximum_image_url: string
}

export interface Title {
  type: string
  title: string
}

export interface Aired {
  from: string
  to: any
  prop: Prop
  string: string
}

export interface Prop {
  from: From
  to: To
}

export interface From {
  day: number
  month: number
  year: number
}

export interface To {
  day: any
  month: any
  year: any
}

export interface Broadcast {
  day: string
  time: string
  timezone: string
  string: string
}

export interface Producer {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Licensor {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Studio {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Genre {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Theme {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Demographic {
  mal_id: number
  type: string
  name: string
  url: string
}

const SEARCH_CRUNCHYROLL_ANIME = gql(`
  query SearchCrunchyrollHandle($origin: String!, $search: String!) {
    Page {
      media(origin: $origin, search: $search) {
        origin
        id
        url
        uri
        handler
        handles {
          edges {
            node {
              origin
              id
              url
              uri
              handler
              handles {
                edges {
                  node {
                    origin
                    id
                    url
                    uri
                    handler
                  }
                }
              }
              title {
                romanized
                english
                native
              }
            }
          }
        }
      }
    }
  }
`)

const findCrunchyrollAnime = async (context, title: string) => {
  // console.log('findCrunchyrollAnime query', SEARCH_CRUNCHYROLL_ANIME)
  const { data } = await context.client.query({
    query: SEARCH_CRUNCHYROLL_ANIME,
    variables: {
      origin: crynchyrollOrigin,
      search: title
    }
  })
  // console.log('findCrunchyrollAnime', data)
  return data.Page.media[0].handles.edges[0].node
}

const normalizeToMedia = async (data: AnimeResponse, context): NoExtraProperties<Media> => {
  // console.log('Jikan normalizeToMedia', data, context)
  const crunchyrollHandle =
    context.client && data.streaming?.find(site => site.name === 'Crunchyroll')
      ? await findCrunchyrollAnime(context, data.title_english)
      : undefined
  // console.log('crunchyrollHandle', crunchyrollHandle)

  return ({
    ...populateUri({
      origin,
      id: data.mal_id.toString(),
      url: data.url,
      handles: {
        edges:
          crunchyrollHandle  
            ? [{
              node: crunchyrollHandle,
              handleRelationType: HandleRelation.Identical
            }]
            : [],
        nodes:
          crunchyrollHandle
            ? [crunchyrollHandle]
            : []
      }
    }),
    averageScore: data.score,
    description: data.synopsis,
    shortDescription: data.synopsis,
    title: {
      romanized: data.title,
      english: data.title_english,
      native: data.title_japanese
    },
    coverImage: [{
      extraLarge: data.images.webp.large_image_url,
      large: data.images.webp.large_image_url,
      medium: data.images.webp.large_image_url,
      color: ''
    }],
    popularity: data.popularity,
    status:
      data.status === 'Not yet aired' ? MediaStatus.NotYetReleased
      : data.status === 'Currently Airing' ? MediaStatus.Releasing
      : data.status === 'Finished Airing' ? MediaStatus.Finished
      : undefined,
    startDate: {
      year: data.aired.prop.from.year,
      month: data.aired.prop.from.month,
      day: data.aired.prop.from.day
    },
    endDate: {
      year: data.aired.prop.to.year,
      month: data.aired.prop.to.month,
      day: data.aired.prop.to.day
    },
    trailers:
      data.trailer?.youtube_id
        ? [{
          ...populateUri({
            origin: 'yt',
            id: data.trailer.youtube_id,
            url: `https://www.youtube.com/watch?v=${data.trailer.youtube_id}`,
            handles: { edges: [], nodes: [] }
          }),
          thumbnail: data.trailer.images.image_url
        }]
      : undefined,
    // episodes: {
    //   edges: data.episodes?.edges?.filter(Boolean).map(edge => edge?.node && ({
    //     node: {
    //       airingAt: edge.node.airingAt,
    //       episodeNumber: edge.node.episode,
    //       uri: edge.node.id.toString(),
    //       media: edge.node.media,
    //       mediaUri: edge.node?.media?.id.toString(),
    //       timeUntilAiring: edge.node.timeUntilAiring,
    //     }
    //   }))
    // }
  })
}


const normalizeToMediaEpisode = (mediaId: number, data: Episode): NoExtraProperties<MediaEpisode> => {
  const id = data.url?.split('/')[4] ?? mediaId
  const episodeNumber = Number(data.url?.split('/')[7] ?? data.mal_id)

  const airingTime = new Date(data.aired).getTime()

  return ({
    ...populateUri({
      origin,
      id: `${id}-${episodeNumber}`,
      url: data.url,
      handles: {
        edges: [],
        nodes: []
      }
    }),
    airingAt: airingTime,
    number: episodeNumber,
    media: populateUri({
      origin,
      id,
      url: data.url?.split('/').slice(0, 4).join('/') ?? `https://myanimelist.net/anime/${id}/`,
      handles: {
        edges: [],
        nodes: []
      }
    }),
    mediaUri: toUri({ origin, id }),
    timeUntilAiring: (airingTime - Date.now()) / 1000,
    // thumbnail: String
    title: {
      english: data.title,
      native: data.title_japanese,
      romanized: data.title_romanji
    }
    // description: String
  })
}

const fetchMediaEpisodes = throttle(({ id }: { id: number }) =>
  fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`)
    .then(response => response.json())
    .then(json =>
        json.data
          ? ({
            edges: json.data.map(node => ({
              node: normalizeToMediaEpisode(id, node)
            }))
          })
          : undefined
      )
)

const fetchMedia = throttle(({ id }: { id: number }, context) =>
  fetch(`https://api.jikan.moe/v4/anime/${id}/full`)
    .then(response => response.json())
    .then(json =>
        json.data
          ? normalizeToMedia(json.data, context)
          : undefined
      )
)


const getSeasonNow = throttle((page = 1): Promise<Root> =>
  fetch(`https://api.jikan.moe/v4/seasons/now?page=${page}`)
    .then(res => res.json())
)

const getFullSeasonNow = async (_, { season, seasonYear }: MediaParams[1], { fetch }: MediaParams[2], __) => {
  const { data, pagination } = await getSeasonNow()
  const getRest = async (page = 1) => {
    if (page > pagination.last_visible_page) return []
    const { data } = await getSeasonNow(page)
    return [...data, ...await getRest(page + 1)]
  }
  return [...data, ...await getRest()].map(normalizeToMedia)
}

export const resolvers: Resolvers = {
  Page: {
    media: async (...args) => {
      const [, { search, season }] = args
      return (
        season ? await getFullSeasonNow(...args) :
        []
      )
    }
  },
  Query: {
    Media: async (...args) => {
      const [_, { id, uri, origin: _origin }] = args
      if (_origin !== origin) return undefined
      const res = await fetchMedia({ id }, args[2])
      // console.log('Jikan Media', args, res)
      return res
    },
    Page: () => ({})
  },
  Media: {
    episodes: async (...args) => {
      const [{ id: _id, origin: _origin }, , { id = _id, origin: __origin = _origin }] = args
      // console.log('Jikan episodes called with ', args, id, __origin)
      if (__origin !== origin) return undefined
      const res = await fetchMediaEpisodes({ id })
      // console.log('Jikan episodes', res)
      return res
    }
  }
}
