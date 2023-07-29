// https://api.ani.zip/mappings?anilist_id=139274&specials=1


import type { Handle, Resolvers } from 'scannarr'

import { populateUri } from 'scannarr'

import * as anidb from './anidb'
import { Episode, HandleRelation, Media, PlaybackSource } from '../generated/graphql'

export const originUrl = 'https://api.ani.zip/' as const
export const origin = 'anizip' as const
export const categories = ['ANIME'] as const
export const name = 'AniZip' as const
export const official = false as const
export const metadataOnly = true as const

export interface MappingRoot {
  titles: Titles
  episodes: Episodes
  episodeCount: number
  specialCount: number
  mappings: Mappings
}

export interface Titles {
  "x-jat": string
  en: string
  "zh-Hant": string
  ja: string
}

export interface Episodes {
  "1": N1
  "2": N2
  "3": N3
  "4": N4
  "5": N5
  "6": N6
  "7": N7
  "8": N8
  S1: S1
  S2: S2
}

export interface N1 {
  tvdbEid: number
  airdate: string
  seasonNumber: number
  episodeNumber: number
  title: Title
  image: string
  length: number
  summary: string
  episode: string
  anidbEid: number
  rating: string
}

export interface Title {
  ja: string
  en: string
  fr: string
  hu: string
  "x-jat": string
}

export interface N2 {
  tvdbEid: number
  airdate: string
  seasonNumber: number
  episodeNumber: number
  title: Title2
  image: string
  length: number
  episode: string
  anidbEid: number
  rating: string
}

export interface Title2 {
  ja: string
  en: string
  fr: string
  hu: string
  "x-jat": string
}

export interface N3 {
  tvdbEid: number
  airdate: string
  seasonNumber: number
  episodeNumber: number
  title: Title3
  image: string
  length: number
  episode: string
  anidbEid: number
  rating: string
}

export interface Title3 {
  ja: string
  en: string
  fr: string
  hu: string
  "x-jat": string
}

export interface N4 {
  tvdbEid: number
  airdate: string
  seasonNumber: number
  episodeNumber: number
  title: Title4
  image: string
  length: number
  episode: string
  anidbEid: number
}

export interface Title4 {
  ja: string
  en: string
  hu: string
  "x-jat": string
}

export interface N5 {
  tvdbEid: number
  airdate: string
  seasonNumber: number
  episodeNumber: number
  title: Title5
  length: number
  episode: string
  anidbEid: number
}

export interface Title5 {
  en: any
}

export interface N6 {
  tvdbEid: number
  airdate: string
  seasonNumber: number
  episodeNumber: number
  title: Title6
  length: number
  episode: string
  anidbEid: number
}

export interface Title6 {
  en: any
}

export interface N7 {
  tvdbEid: number
  airdate: string
  seasonNumber: number
  episodeNumber: number
  title: Title7
  length: number
  episode: string
  anidbEid: number
}

export interface Title7 {
  en: any
}

export interface N8 {
  tvdbEid: number
  airdate: string
  seasonNumber: number
  episodeNumber: number
  title: Title8
  length: number
  episode: string
  anidbEid: number
}

export interface Title8 {
  en: any
}

export interface S1 {
  episode: string
  anidbEid: number
  length: number
  airdate: string
  rating: string
  title: Title9
  summary: string
}

export interface Title9 {
  ja: string
  en: string
  fr: string
  hu: string
  "x-jat": string
}

export interface S2 {
  episode: string
  anidbEid: number
  length: number
  airdate: string
  title: Title10
}

export interface Title10 {
  ja: string
  en: string
  "x-jat": string
}

export interface Mappings {
  animeplanet_id: string
  kitsu_id: number
  mal_id: number
  type: string
  anilist_id: number
  anisearch_id: number
  anidb_id: number
  notifymoe_id: string
  livechart_id: number
  thetvdb_id: number
  imdb_id: any
  themoviedb_id: any
}

const AniZipToLaserrSource = {
  'animeplanet': 'animeplanet',
  'anidb_id': 'anidb',
  'anilist_id': 'anilist',
  'kitsu_id': 'kitsu',
  'mal_id': 'mal',
  'notifymoe_id': 'notifymoe',
  'livechart_id': 'livechart',
  'thetvdb_id': 'tvdb',
  'imdb_id': 'imdb',
  'themoviedb_id': 'tmdb',
  'anisearch': 'anisearch'
}

const mappingToScannarrMedia = (res: MappingRoot): Media => {
  const handles =
    Object
      .entries(res.mappings)
      .map(([source, mapping]) => populateUri({
        id: mapping,
        origin: AniZipToLaserrSource[source],
        handles: {
          edges: [],
          nodes: []
        }
      }))
      .filter(handle => handle.origin && handle.id)

  const handleProps = populateUri({
    origin,
    id: res.mappings.anidb_id,
    url: `https://api.ani.zip/mappings?anidb_id=${res.mappings.anidb_id}`,
    handles: {
      edges: handles.map(handle => ({ node: handle })),
      nodes: handles
    }
  })

  const episodes =
    Object
      .entries(res.episodes)
      .map(([key, episode]) => {
        const anidbEpisodeHandle = populateUri({
          origin,
          id: episode.anidbEid,
          url: `https://anidb.net/episode/${episode.anidbEid}`,
          handles: {
            edges: [],
            nodes: []
          },
          mediaUri: handleProps.uri,
          number: episode.episodeNumber
        })

        return ({
          ...populateUri({
            origin,
            id: `${res.mappings.anidb_id}-${episode.anidbEid}`,
            url: `https://anidb.net/episode/${episode.anidbEid}`,
            handles: {
              edges: [{
                node: anidbEpisodeHandle,
                handleRelationType: HandleRelation.Identical
              }],
              nodes: [anidbEpisodeHandle]
            }
          }),
          mediaUri: handleProps.uri,
          number: episode.episodeNumber,
          title: {
            english: episode.title.en,
            native: episode.title.ja,
          },
          thumbnail: episode.image,
          airingAt: new Date(episode.airdate).getTime(),
          timeUntilAiring: new Date(episode.airdate).getTime() - Date.now()
        }) as Episode
      })
      .filter(episode => episode.number !== undefined && episode.number !== null)

  return ({
    ...handleProps,
    title: {
      english: res.titles.en,
      native: res.titles.ja,
    },
    episodeCount: res.episodeCount,
    episodes: {
      edges: episodes.map(episode => ({ node: episode })),
      nodes: episodes
    }
  })
}

const fetchAnidbMappings = (id: string, { fetch = window.fetch }) =>
  fetch(`https://api.ani.zip/mappings?anidb_id=${id}&specials=1`)
    .then(res => res.json())
    .then(mappingToScannarrMedia)

export const resolvers: Resolvers = {
  Page: {
    media: async (...args) => {
      const [_, { id: _id, origin: _origin }] = args
      if (_origin !== origin || !_id) return []
      const res = await fetchAnidbMappings(_id, {})
      // console.log('Page.media res', res)
      return res ? [res] : []
    }
  },
  Query: {
    Page: () => ({}),
    Media: async (...args) => {
      const [_, { id: _id, origin: _origin }] = args
      if (_origin !== origin || !_id) return undefined
      const res = await fetchAnidbMappings(_id, {})
      // console.log('Media res', res)
      return res
    }
  }
} satisfies Resolvers
