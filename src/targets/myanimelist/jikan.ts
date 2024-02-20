import type { MediaParams, NoExtraProperties } from '../../utils/type'

import { populateHandle, toUri, GraphQLTypes } from 'scannarr'
import { origin as crynchyrollOrigin } from '../crunchyroll/crunchyroll-beta'
import { gql } from '../../generated'
import { swAlign } from 'seal-wasm'
import { RecentEpisodes } from './jikan-types'
import { HandleRelation } from '../../generated/graphql'

export const icon = 'https://cdn.myanimelist.net/images/favicon.ico'
export const originUrl = 'https://myanimelist.net'
export const origin = 'mal'
export const categories = ['ANIME']
export const name = 'MyAnimeList'
export const official = true
export const metadataOnly = true
export const supportedUris = ['mal']

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
  query SearchCrunchyrollHandle($input: MediaPageInput!) {
    mediaPage(input: $input) {
      nodes {
        origin
        id
        url
        uri
        title {
          english
          romanized
          native
        }
        handles {
          edges {
            node {
              origin
              id
              url
              uri
              title {
                english
                romanized
                native
              }
              handles {
                edges {
                  node {
                    origin
                    id
                    url
                    uri
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`)

const findCrunchyrollAnime = async (context, title: string) => {
  const { data } = await context.client.query({
    query: SEARCH_CRUNCHYROLL_ANIME,
    variables: {
      input: {
        origin: crynchyrollOrigin,
        search: title
      }
    }
  })

  if (!data.mediaPage?.nodes.length) return undefined
  const bestResult = data.mediaPage?.nodes[0].handles.edges[0].node
  const left = title.length > bestResult.title.english.length ? title : bestResult.title.english
  const right = title.length > bestResult.title.english.length ? bestResult.title.english : title
  const alignment = await swAlign(left.toLowerCase(), right.toLowerCase(), { alignment: 'local', equal: 2, align: -1, insert: -1, delete: -1 })
  const inputScore = left.length * 2
  const score = alignment.score / inputScore
  return score > 0.9 ? bestResult : undefined
}

const normalizeToMedia = async (data: AnimeResponse, context): NoExtraProperties<Media> => {
  const searchTitle = data.title_english ?? data.title
  const crunchyrollHandle =
    context.client && data.streaming?.find(site => site.name === 'Crunchyroll') && searchTitle
      ? await findCrunchyrollAnime(context, searchTitle)
      : undefined

  const aniDBSource =
    data.external?.find(site => site.name === 'AniDB')
  const aniDBId =
    aniDBSource
      ? (
        new URL(aniDBSource?.url).searchParams.get('aid')
        ?? new URL(aniDBSource?.url).pathname.split('/')[2]
      )
      : undefined

  // todo: make a system to automatically create handle lists that are using same ids
  const aniDBHandle =
    aniDBSource
      ? populateHandle({
        origin: 'anidb',
        id: aniDBId,
        url: aniDBSource?.url,
        handles: {
          edges: []
        }
      })
      : undefined

  const animetoshoHandle =
    aniDBSource
      ? populateHandle({
        origin: 'animetosho',
        id: aniDBId,
        url: `https://animetosho.org/series/_.${aniDBId}`,
        handles: {
          edges: []
        }
      })
      : undefined

  const anizipHandle =
    aniDBSource
      ? populateHandle({
        origin: 'anizip',
        id: aniDBId,
        url: `https://api.ani.zip/mappings?anidb_id=${aniDBId}`,
        handles: {
          edges: []
        }
      })
      : undefined
  // console.log('crunchyrollHandle', crunchyrollHandle)

  return ({
    ...populateHandle({
      origin,
      id: data.mal_id.toString(),
      url: data.url,
      handles: {
        edges: [
          ...crunchyrollHandle ? [{
            node: crunchyrollHandle,
            handleRelationType: HandleRelation.Identical
          }] : [],
          ...aniDBHandle ? [{
            node: aniDBHandle,
            handleRelationType: HandleRelation.Identical
          }] : [],
          ...animetoshoHandle ? [{
            node: animetoshoHandle,
            handleRelationType: HandleRelation.Identical
          }] : [],
          ...anizipHandle ? [{
            node: anizipHandle,
            handleRelationType: HandleRelation.Identical
          }] : []
        ]
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
      data.status === 'Not yet aired' ? GraphQLTypes.MediaStatus.NotYetReleased
      : data.status === 'Currently Airing' ? GraphQLTypes.MediaStatus.Releasing
      : data.status === 'Finished Airing' ? GraphQLTypes.MediaStatus.Finished
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
          ...populateHandle({
            origin: 'yt',
            id: data.trailer.youtube_id,
            url: `https://www.youtube.com/watch?v=${data.trailer.youtube_id}`,
            handles: { edges: [] }
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


const normalizeToEpisode = (mediaId: number, data: Episode): NoExtraProperties<Episode> => {
  const id = data.url?.split('/')[4] ?? mediaId
  const episodeNumber = Number(data.url?.split('/')[7] ?? data.mal_id)

  const airingTime = new Date(data.aired).getTime()

  return ({
    ...populateHandle({
      origin,
      id: `${id}-${episodeNumber}`,
      url: data.url,
      handles: {
        edges: []
      }
    }),
    airingAt: airingTime,
    number: episodeNumber,
    media: populateHandle({
      origin,
      id,
      url: data.url?.split('/').slice(0, 4).join('/') ?? `https://myanimelist.net/anime/${id}/`,
      handles: {
        edges: [],
        nodes: []
      }
    }),
    mediaUri: toUri({ origin, id }),
    timeUntilAiring: airingTime - Date.now(),
    // thumbnail: String
    title: {
      english: data.title,
      native: data.title_japanese,
      romanized: data.title_romanji
    }
    // description: String
  })
}

const fetchEpisodes = ({ id }: { id: number }, context: MediaParams[2]) =>
  context
    .fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`)
    .then(response => response.json())
    .then(json =>
        json.data
          ? ({
            edges: json.data.map(node => ({
              node: normalizeToEpisode(id, node)
            }))
          })
          : undefined
      )

const fetchSearchAnime = ({ search }: { search: string }, context: MediaParams[2]) =>
  context
    .fetch(`https://api.jikan.moe/v4/anime?q=${search}`)
    .then(response => response.json())
    .then(json =>
      console.log('json', json) ||
      json.data
        ? json.data.map(media => normalizeToMedia(media, context))
        : undefined
    )

const fetchMedia = ({ id }: { id: number }, context: MediaParams[2]) =>
  context
    .fetch(`https://api.jikan.moe/v4/anime/${id}/full`)
    .then(response => response.json())
    .then(json =>
      json.data
        ? normalizeToMedia(json.data, context)
        : undefined
    )


const getSeasonNow = (page = 1, context: MediaParams[2]): Promise<Root> =>
  context
    .fetch(`https://api.jikan.moe/v4/seasons/now?page=${page}`)
    .then(res => res.json())

const getRecentEpisodesJson = (page = 1, context: MediaParams[2]): Promise<RecentEpisodes> =>
  context
    .fetch(`https://api.jikan.moe/v4/watch/episodes?page=${page}`)
    .then(res => res.json())

const getRecentEpisodes = (page = 1, context: MediaParams[2]): Promise<Episode[]> =>
  getRecentEpisodesJson(page, context)
    .then(({ data }) =>
      data.map(item =>
        item
          .episodes
          .map(episode => ({
            ...populateHandle({
              origin,
              id: `${item.entry.mal_id}-${episode.mal_id}`,
              url: episode.url,
              handles: {
                edges: []
              }
            }),
            number: episode.mal_id,
            media: populateHandle({
              origin,
              id: item.entry.mal_id.toString(),
              url: item.entry.url,
              handles: {
                edges: []
              },
              title: {
                romanized: item.entry.title
              },
              coverImage: [{
                extraLarge: item.entry.images.webp.large_image_url,
                large: item.entry.images.webp.large_image_url,
                medium: item.entry.images.webp.large_image_url,
                color: ''
              }]
            }),
            mediaUri: toUri({ origin, id: item.entry.mal_id.toString() }),
            // thumbnail: item.thumbnail,
            title: {
              romanized:
                episode.title.startsWith('Episode')
                  ? undefined
                  : episode.title
            }
          }))
          .at(0)
      )
      .filter(episode => episode.number !== undefined && episode.number !== null)
    )

const getFullSeasonNow = async (_, { season, seasonYear }: MediaParams[1], context: MediaParams[2], __) => {
  const { data, pagination } = await getSeasonNow(1, context)
  const getRest = async (page = 1) => {
    if (page > pagination.last_visible_page) return []
    const { data } = await getSeasonNow(page, context)
    return [...data, ...await getRest(page + 1)]
  }
  return (
    [...data, ...await getRest()]
      .map(normalizeToMedia)
  )
}

const searchAnime = async (_, { search }: MediaParams[1], context: MediaParams[2], __) =>
  fetchSearchAnime({ search: search! }, context)

export const resolvers: Resolvers = {
  Query: {
    media: async (...args) => {
      // console.log('Jikan Query.Media', args)
      const [_, { id: _id, uri, origin: _origin }] = args
      if (_origin !== origin || !_id) return undefined
      const [id] = _id.split('-').map(Number)
      const res = await fetchMedia({ id }, args[2])
      // console.log('Jikan Media', args, res)
      return res
    },
    mediaPage: async (...args) => {
      const [, { search, season }] = args
      // console.log('media jikan', args)
      return {
        nodes: (
          search ? await searchAnime(...args) :
          season ? await getFullSeasonNow(...args)
          : []
        )
      }
    },
    episode: async (...args) => {
      const [_, { id: _id, origin: _origin }] = args
      // console.log('Jikan Episode', args, id, __origin)
      if (_origin !== origin || !_id) return undefined
      const [id, episodeNumber] = _id.split('-').map(Number)
      if (!id) return undefined
      const res = await fetchEpisodes({ id }, args[2])
      // console.log('Jikan Episode', res, res?.edges?.find(({ node }) => node.number === episodeNumber)?.node)
      return res?.edges?.find(({ node }) => node.number === episodeNumber)?.node
    }
  }
} satisfies Resolvers
