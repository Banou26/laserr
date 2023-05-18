
// todo: impl using https://github.com/crunchy-labs/crunchy-cli/blob/master/crunchyroll.go as ref

import { Resolvers } from 'scannarr'
import { GetEpisodesData, GetEpisodesMeta, GetSeriesData, SearchData, SearchMeta } from './types'
import { async } from 'rxjs'
import pThrottle from 'p-throttle'
import { fromUri, fromUris, populateUri } from 'scannarr'

const throttle = pThrottle({
	limit: 1,
	interval: 1_000
})

export const icon = 'https://static.crunchyroll.com/cxweb/assets/img/favicons/favicon-96x96.png'
export const originUrl = 'https://www.crunchyroll.com'
export const categories: Category[] = ['ANIME']
export const name = 'Crunchyroll'
export const origin = 'cr'

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
    stealth: "https://www.crunchyroll.com/search",
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

const getSeries = (mediaId: string) =>
  fetch(`https://www.crunchyroll.com/content/v2/cms/series/${mediaId}?preferred_audio_language=ja-JP&locale=fr-FR`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "authorization": "Bearer X",
      "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    },
    "referrer": "https://www.crunchyroll.com/fr/series/GYEXQKJG6/dr-stone",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  })
  .then(async res => (await res.json()) as { total: number, data: GetSeriesData[] })

const getEpisodes = (mediaId: string) => 
  fetch(`https://www.crunchyroll.com/content/v2/cms/seasons/${mediaId}/episodes?preferred_audio_language=ja-JP&locale=fr-FR`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "authorization": "Bearer X",
      "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    },
    "referrer": "https://www.crunchyroll.com/fr/series/GYEXQKJG6/dr-stone",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  })
    .then(async res => (await res.json()) as { total: number, data: GetEpisodesData[], meta: GetEpisodesMeta })

const search = (query: string) =>
  // 100 episodes
  fetch("https://www.crunchyroll.com/content/v2/discover/search?q=Dr+Stone&n=100&start=100&type=episode&preferred_audio_language=ja-JP&locale=fr-FR", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "authorization": "Bearer X",
      "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    },
    "referrer": "https://www.crunchyroll.com/fr/search?f=episode&q=Dr%20Stone",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
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

const searchAnime = async (title: string, { fetch = window.fetch }) =>
  fetch(`https://www.crunchyroll.com/content/v2/discover/search?${makeSearchParams({ search: title, type: ['series'] })}`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "authorization": `Bearer ${(await getToken({ fetch })).access_token}`,
    },
    proxyCache: '3600000',
    stealth: "https://www.crunchyroll.com/search",
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  })

// 6 episodes, series, music & concerts 
// fetch("https://www.crunchyroll.com/content/v2/discover/search?q=Dr+Sto&n=6&type=music,series,episode,top_results,movie_listing&preferred_audio_language=ja-JP&locale=fr-FR", {
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
//   "referrer": "https://www.crunchyroll.com/fr/search?q=Dr%20Sto",
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
      console.log('Crunchyroll Page Media called with ', args, id, _origin)

      if (_origin !== origin) return undefined

      const result = searchAnime(search, { fetch })
      console.log('Crunchyroll Page Media result ', result)

      return undefined
    }
  },
  Query: {
    Media: async (...args) => {
      const [_, { id, uri, origin: _origin }] = args
      if (_origin !== origin) return undefined

      console.log('Crunchyroll Media called with ', args, id, _origin)
      return undefined
    },
    // Episode: async (...args) => {
    //   const [_, { id, uri, origin: _origin }] = args
    //   if (_origin !== origin) return undefined

    //   return {
    //     ...populateUri({
    //       origin,
    //       id: id,
    //       url: null,
    //       handles: []
    //     })
    //   }
    // },
    Page: async (...args) => {
      const [_, { id, uri, origin: _origin, search }] = args
      console.log('Crunchyroll Page called with ', args, id, _origin)
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
