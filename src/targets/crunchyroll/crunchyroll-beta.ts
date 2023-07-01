
import type { Media, MediaEpisode, Resolvers } from 'scannarr'

import type { GetEpisodesData, GetEpisodesMeta, GetSeriesData, SearchData, SearchMeta } from './types'

import pThrottle from 'p-throttle'
import { populateUri } from 'scannarr'
import { swAlign } from 'seal-wasm'

import { NoExtraProperties } from '../../utils/type'
import { toUri } from 'scannarr'
import { MediaEpisodePlaybackType } from 'scannarr'

// todo: impl using https://github.com/crunchy-labs/crunchy-cli/blob/master/crunchyroll.go as ref

const throttle = pThrottle({
	limit: 1,
	interval: 1_000
})

export const icon = 'https://static.crunchyroll.com/cxweb/assets/img/favicons/favicon-96x96.png'
export const originUrl = 'https://www.crunchyroll.com'
export const categories: Category[] = ['ANIME']
export const name = 'Crunchyroll'
export const origin = 'cr'
export const official = true
export const metadataOnly = false

export interface GetEpisodeResponse {
  total: number
  data: GetEpisodeData[]
  meta: Meta
}

export interface GetEpisodeData {
  title: string
  description: string
  images: Images
  slug_title: string
  rating: Rating
  episode_metadata: CrunchyrollEpisode
  type: string
  slug: string
  id: string
  streams_link: string
  linked_resource_key: string
  external_id: string
  promo_description: string
  channel_id: string
  promo_title: string
}

export interface Images {
  thumbnail: Thumbnail[][]
}

export interface Thumbnail {
  height: number
  source: string
  type: string
  width: number
}

export interface Rating {
  down: Down
  total: number
  up: Up
}

export interface Down {
  displayed: string
  unit: string
}

export interface Up {
  displayed: string
  unit: string
}

export interface EpisodeMetadata {
  ad_breaks: AdBreak[]
  audio_locale: string
  availability_ends: string
  availability_notes: string
  availability_starts: string
  available_date: any
  available_offline: boolean
  closed_captions_available: boolean
  duration_ms: number
  eligible_region: string
  episode: string
  episode_air_date: string
  episode_number: number
  extended_maturity_rating: ExtendedMaturityRating
  free_available_date: string
  identifier: string
  is_clip: boolean
  is_dubbed: boolean
  is_mature: boolean
  is_premium_only: boolean
  is_subbed: boolean
  mature_blocked: boolean
  maturity_ratings: string[]
  premium_available_date: string
  premium_date: any
  season_id: string
  season_number: number
  season_slug_title: string
  season_title: string
  sequence_number: number
  series_id: string
  series_slug_title: string
  series_title: string
  subtitle_locales: string[]
  upload_date: string
  versions: Version[]
}

export interface AdBreak {
  offset_ms: number
  type: string
}

export interface ExtendedMaturityRating {}

export interface Version {
  audio_locale: string
  guid: string
  is_premium_only: boolean
  media_guid: string
  original: boolean
  season_guid: string
  variant: string
}

export interface Meta {}



export interface CrunchyrollSerie {
  id: string
  description: string
  type: string
  new: boolean
  rating: Rating
  slug: string
  search_metadata: SearchMetadata
  promo_description: string
  slug_title: string
  linked_resource_key: string
  external_id: string
  title: string
  series_metadata: SeriesMetadata
  images: Images
  channel_id: string
  promo_title: string
}

export interface Rating {
  "3s": N3s
  "4s": N4s
  "5s": N5s
  average: string
  total: number
  "1s": N1s
  "2s": N2s
}

export interface N3s {
  displayed: string
  percentage: number
  unit: string
}

export interface N4s {
  displayed: string
  percentage: number
  unit: string
}

export interface N5s {
  displayed: string
  percentage: number
  unit: string
}

export interface N1s {
  displayed: string
  percentage: number
  unit: string
}

export interface N2s {
  displayed: string
  percentage: number
  unit: string
}

export interface SearchMetadata {
  score: number
}

export interface SeriesMetadata {
  audio_locales: string[]
  availability_notes: string
  episode_count: number
  extended_description: string
  extended_maturity_rating: ExtendedMaturityRating
  is_dubbed: boolean
  is_mature: boolean
  is_simulcast: boolean
  is_subbed: boolean
  mature_blocked: boolean
  maturity_ratings: string[]
  season_count: number
  series_launch_year: number
  subtitle_locales: string[]
  tenant_categories: string[]
}

export interface ExtendedMaturityRating {}

export interface Images {
  poster_tall: PosterTall[][]
  poster_wide: PosterWide[][]
}

export interface PosterTall {
  height: number
  source: string
  type: string
  width: number
}

export interface PosterWide {
  height: number
  source: string
  type: string
  width: number
}

export interface CrunchyrollEpisode {
  season_tags: string[]
  season_number: number
  images: Images
  is_subbed: boolean
  season_id: string
  recent_audio_locale: string
  streams_link?: string
  slug_title: string
  eligible_region: string
  upload_date: string
  series_slug_title: string
  series_id: string
  availability_notes: string
  premium_available_date: string
  available_date: any
  description: string
  episode_air_date: string
  audio_locale: string
  channel_id: string
  next_episode_title?: string
  mature_blocked: boolean
  versions: Version[]
  ad_breaks: AdBreak[]
  season_slug_title: string
  identifier: string
  is_premium_only: boolean
  series_title: string
  episode: string
  slug: string
  is_mature: boolean
  maturity_ratings: string[]
  closed_captions_available: boolean
  media_type: string
  production_episode_id: string
  premium_date: any
  listing_id: string
  extended_maturity_rating: ExtendedMaturityRating
  duration_ms: number
  is_dubbed: boolean
  next_episode_id?: string
  sequence_number: number
  hd_flag: boolean
  seo_title: string
  seo_description: string
  available_offline: boolean
  season_title: string
  free_available_date: string
  subtitle_locales: string[]
  episode_number: number
  availability_starts: string
  title: string
  is_clip: boolean
  availability_ends: string
  id: string
}

export interface Images {
  thumbnail: Thumbnail[][]
}

export interface Thumbnail {
  height: number
  source: string
  type: string
  width: number
}

export interface Version {
  audio_locale: string
  guid: string
  is_premium_only: boolean
  media_guid: string
  original: boolean
  season_guid: string
  variant: string
}

export interface AdBreak {
  offset_ms: number
  type: string
}

export interface ExtendedMaturityRating {}



// needs to have the etp_rt cookie set, for this, we need to authenticate
// export const getToken = () =>
//   fetch(`https://beta-api.crunchyroll.com/auth/v1/token`, {
//     method: 'POST',
//     headers: {
//         Authorization: 'Basic bm9haWhkZXZtXzZpeWcwYThsMHE6',
//         'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     body: new URLSearchParams({grant_type: 'etp_rt_cookie'})
//   }).then(res => res.json()).then(res => res.data.session_id)

type CrunchyrollAuthToken = {
  timestamp: number;
  readonly access_token: string;
  readonly expires_in: number;
  readonly token_type: "Bearer";
  readonly scope: "account content offline_access";
  readonly country: string;
}

let _token: CrunchyrollAuthToken

export const fetchToken = async ({ fetch = window.fetch }) =>
  fetch('https://www.crunchyroll.com/auth/v1/token', {
    headers: {
      accept: 'application/json, text/plain, */*',
      authorization: `Basic ${btoa('cr_web:')}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    hostname: "www.crunchyroll.com",
    pathname: "/auth/v1/token",
    protocol: "https:",
    search: "",
    body: 'grant_type=client_id',
    method: 'POST',
    mode: 'cors',
    credentials: 'include'
  })
    .then(res => res.json())
    .then(res => {
      const token = ({
        timestamp: Date.now(),
        access_token: res.access_token as string,
        expires_in: res.expires_in as number,
        token_type: 'Bearer',
        scope: 'account content offline_access',
        country: 'US' as string
      }) as const
      _token = token
      localStorage.setItem('crunchyroll-token', JSON.stringify(token))
      return token
    })

const getToken = ({ fetch = window.fetch }) => {
  const savedToken: CrunchyrollAuthToken | undefined = JSON.parse(localStorage.getItem('crunchyroll-token') || 'null') ?? _token ?? undefined
  if (savedToken && Date.now() - savedToken.timestamp < savedToken.expires_in * 1000) return savedToken
  return fetchToken({ fetch })
}

const getSeries = async (mediaId: string, { fetch = window.fetch }) =>
  fetch(`https://www.crunchyroll.com/content/v2/cms/series/${mediaId}?preferred_audio_language=ja-JP&locale=en-US`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "authorization": `Bearer ${(await getToken({ fetch })).access_token}`,
    },
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  })
  .then(async res => (await res.json()) as { total: number, data: GetSeriesData[] })
  .then(async res => {
    // const episodes = 
    // console.log('CR EPISODES', await getEpisodes(mediaId, { fetch }))

    return res.data[0] && crunchyrollSerieToScannarrMedia(res.data[0]!)
  })

const getSeason = async (mediaId: string, { fetch = window.fetch }) =>
  fetch(`https://www.crunchyroll.com/content/v2/cms/series/${mediaId}/seasons?force_locale=&preferred_audio_language=ja-JP&locale=fr-FR`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "authorization": `Bearer ${(await getToken({ fetch })).access_token}`,
    },
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  })
  .then(async res => (await res.json()) as { total: number, data: GetSeriesData[] })
  .then(async res => {
    // const episodes = 
    
    const ret = (
      res.data[0]
        ? ({
          ...crunchyrollSeasonToScannarrMedia(res.data[0]!),
          episodes: async () => {
            const episodes = await getEpisodes(res.data[0]?.id, { fetch })
            // console.log('CR EPISODES', episodes)

            return {
              edges: episodes.map(episode => ({ node: episode })),
              nodes: episodes
            }
          }
        })
        : undefined
    )

    // console.log('RETTTTTTTTT', ret)

    return ret
  })

const getEpisodes = async (mediaId: string, { fetch = window.fetch }) => 
  fetch(`https://www.crunchyroll.com/content/v2/cms/seasons/${mediaId}/episodes?preferred_audio_language=ja-JP&locale=en-US`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "authorization": `Bearer ${(await getToken({ fetch })).access_token}`,
    },
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  })
    .then(async res => (await res.json()) as { total: number, data: GetEpisodesData[], meta: GetEpisodesMeta })
    .then(res => res.data.map(episodeData => crunchyrollEpisodeToScannarrMediaEpisode(mediaId, episodeData)))

const getEpisode = async (mediaId: string, episodeId: string, { fetch = window.fetch }) => 
  fetch(`https://www.crunchyroll.com/content/v2/cms/objects/${episodeId}?ratings=true&locale=en-US`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "authorization": `Bearer ${(await getToken({ fetch })).access_token}`,
    },
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  })
    .then(async res => (await res.json()) as { total: number, data: GetEpisodeData[], meta: GetEpisodesMeta })
    .then(res => res.data[0] ? crunchyrollEpisodeToScannarrMediaEpisode(mediaId, res.data[0]) : undefined)

const search = async (query: string, { fetch = window.fetch }) =>
  // 100 episodes
  fetch("https://www.crunchyroll.com/content/v2/discover/search?q=Dr+Stone&n=100&start=100&type=episode&preferred_audio_language=ja-JP&locale=en-US", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "authorization": `Bearer ${(await getToken({ fetch })).access_token}`,
    },
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  }).then(async res => (await res.json()) as { total: number, data: SearchData[], meta: SearchMeta })

const makeSearchParams = (
  { search, n = 50, type, locale = 'en-US', ratings = true }:
  {
    search: string,
    n?: number,
    type: ('music'| 'series' | 'episode' | 'top_results' | 'movie_listing')[],
    locale?: string,
    ratings?: boolean
  }
) =>
  new URLSearchParams({ q: search, n: n.toString(), type: type.join(','), locale, ratings: ratings.toString() }).toString()


const crunchyrollSerieToScannarrMedia = (serie: CrunchyrollSerie): NoExtraProperties<Media> => ({
  ...populateUri({
    origin,
    id: serie.id,
    url: `https://www.crunchyroll.com/series/${serie.id}`,
    handles: {
      edges: []
    }
  }),
  averageScore: Number(serie.rating.average) / 5,
  coverImage: [{
    extraLarge: serie.images.poster_tall.at(-1)?.source,
    large: serie.images.poster_tall.at(-1)?.source,
    medium: serie.images.poster_tall.at(-1)?.source
  }],
  description: serie.description,
  title: {
    english: serie.title
  }
})

const crunchyrollSeasonToScannarrMedia = (serie: CrunchyrollSerie): NoExtraProperties<Media> => ({
  ...populateUri({
    origin,
    id: serie.series_id,
    url: `https://www.crunchyroll.com/series/${serie.id}`,
    handles: {
      edges: []
    }
  }),
  description: serie.description,
  title: {
    english: serie.title
  }
})

const crunchyrollEpisodeToScannarrMediaEpisode = (mediaId: string, episode: CrunchyrollEpisode): NoExtraProperties<MediaEpisode> => ({
  ...populateUri({
    origin,
    id: `${mediaId}-${episode.id}`,
    url: `https://www.crunchyroll.com/watch/${episode.id}`,
    handles: {
      edges: []
    }
  }),
  number: Number(episode.episode),
  mediaUri: toUri({ origin, id: mediaId }),
  description: episode.description,
  title: {
    english: episode.title
  },
  playback:
    episode.external_id
      ? {
        type: MediaEpisodePlaybackType.Iframe,
        origin,
        url: `https://www.crunchyroll.com/affiliate_iframeplayer?${
          new URLSearchParams({
            aff: 'af-44915-aeey',
            media_id: episode.external_id.replace('EPI.', ''),
            video_format: 0,
            video_quality: 0,
            auto_play: 0
          })
        }`
      }
      : undefined
})

const searchAnime = async (title: string, { fetch = window.fetch }) =>
  fetch(`https://www.crunchyroll.com/content/v2/discover/search?${makeSearchParams({ search: title, type: ['series'] })}`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "authorization": `Bearer ${(await getToken({ fetch })).access_token}`,
    },
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  })
  .then(async res => (await res.json()) as { total: number, data: SearchData[], meta: SearchMeta })
  .then(({ data }) => data[0]?.items.filter(({ type }) => type === 'series'))
  .then(async (series) => {
    const seriesScore =
      (
        await Promise.all(
          series
            ?.map(async (serie) => {
              const alignment = await swAlign(
                title.toLowerCase(),
                serie.title.toLowerCase(),
                { alignment: 'local', equal: 2, align: -1, insert: -1, delete: -1 }
              )
              
              return ({
                serie,
                score: alignment.score / Math.max(title.length, serie.title.length),
                alignment
              })
            })
          ?? []
        )
      )
      .sort((a, b) => b.score - a.score)
    const bestMatch = seriesScore[0]
    if (!bestMatch || bestMatch.score < 0.5) return
    return crunchyrollSerieToScannarrMedia(bestMatch.serie)
  })

// 6 episodes, series, music & concerts 
// fetch("https://www.crunchyroll.com/content/v2/discover/search?q=Dr+Sto&n=6&type=music,series,episode,top_results,movie_listing&preferred_audio_language=ja-JP&locale=en-US", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en-US,en;q=0.9",
//     "authorization": "Bearer X",
//     "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin"
//   },
//   "referrer": "https://www.crunchyroll.com/search?q=Dr%20Sto",
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": null,
//   "method": "GET",
//   "mode": "cors",
//   "credentials": "include"
// })

// export const search = () => {
//   // const payload = {'session_id' : sessionId, 'media_type' : 'anime', 'fields':'series.url,series.series_id','limit':'1500','filter':'prefix:the-devil'}
//   // fetch(`https://beta-api.crunchyroll.com/content/v1/search?session_id=${sessionId}&q=the devil`)
// }

export const resolvers: Resolvers = {
  Page: {
    media: async (...args) => {
      const [_, { id, uri, origin: _origin, search }, { fetch }] = args
      // console.log('Crunchyroll Page Media called with ', args, id, _origin)

      if (_origin !== origin) return []

      const result = await searchAnime(search, { fetch })
      // console.log('Crunchyroll Page Media result ', result)

      return [result]
    }
  },
  Query: {
    Media: async (...args) => {
      const [_, { id, uri, origin: _origin }, { fetch }] = args
      if (_origin !== origin) return undefined

      const result = await getSeason(id, { fetch })
      // console.log('Crunchyroll Media called with ', args, id, _origin, result)
      return result
    },
    Episode: async (...args) => {
      const [_, { id, uri, origin: _origin }, { fetch }] = args
      const [mediaId, episodeId] = id?.split('-')
      if (_origin !== origin || !episodeId || !episodeId) return undefined

      const res = await getEpisode(mediaId, episodeId, { fetch })
      // console.log('Crunchyroll Episode called with ', args, id, _origin, res)

      return res
    },
    Page: async (...args) => {
      const [_, { id, uri, origin: _origin, search }] = args
      // console.log('Crunchyroll Page called with ', args, id, _origin)
      return ({})
    }
  },
  // Media: {
  //   episodes: async (...args) => {
  //     const [{ id: _id, origin: _origin }, , { id = _id, origin: __origin = _origin }] = args
  //     console.log('Crunchyroll episodes called with ', args, id, __origin)
  //     if (__origin !== origin) return undefined

  //     return res
  //   }
  //   episode: async (...args) => {
  //     const [{ id: _id, origin: _origin }, , { id = _id, origin: __origin = _origin }] = args
  //     console.log('Crunchyroll episodes called with ', args, id, __origin)
  //     if (__origin !== origin) return undefined

  //     return res
  //   }
  // }
}
