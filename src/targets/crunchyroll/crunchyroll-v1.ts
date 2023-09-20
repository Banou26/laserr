import pThrottle from 'p-throttle'
import { from } from 'rxjs'

import { LanguageTag } from '../../utils'
import { populateHandle } from 'scannarr'

const throttle = pThrottle({
	limit: 4,
	interval: 1_000
})

// Can get new crunchy IDs from https://www.crunchyroll.com/fr/series/GYEXQKJG6/dr-stone
// to episodes, tho needs bearer, can probably get one manually tho?
// fetch("https://www.crunchyroll.com/content/v2/cms/seasons/GR9XGX1EY/episodes?locale=fr-FR", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en-US,en;q=0.9",
//     "authorization": "Bearer X",
//     "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin"
//   },
//   "referrer": "https://www.crunchyroll.com/fr/series/GYEXQKJG6/dr-stone",
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": null,
//   "method": "GET",
//   "mode": "cors",
//   "credentials": "include"
// });

// ca go from new IDS like https://www.crunchyroll.com/fr/watch/GN7UDVKPQ/new-world-map
// to external IDs for embed thru https://www.crunchyroll.com/content/v2/cms/objects/GN7UDVKPQ?ratings=true&locale=fr-FR
// check external_id "external_id": "EPI.895218"

// https://www.crunchyroll.com/favicons/favicon-32x32.png
export const icon = 'https://www.crunchyroll.com/favicons/apple-touch-icon.png'
export const origin = 'https://www.crunchyroll.com/'
export const categories = ['ANIME']
export const name = 'Crunchyroll'
// export const scheme = 'crunchyroll'
export const scheme = 'cr'

// access_token and device_type taken from
// https://github.com/streamlink/streamlink/blob/867b9b3b66aab57c0fcb3ab117a275f29a23b71a/src/streamlink/plugins/crunchyroll.py#L102-L103
// https://github.com/streamlink/streamlink/issues/4453#issuecomment-1114520315
// If these break, we can get new ones from the Microsoft Store Crunchyroll application, or the android/ios mobile app
export const generateSessionId = () =>
  fetch(
    `https://api.crunchyroll.com/start_session.0.json?${
      new URLSearchParams({
        access_token: 'LNDJgOit5yaRIWN',
        device_type: 'com.crunchyroll.windows.desktop',
        device_id: Math.random().toString()
      })
    }`)
      .then(res => res.json())
      .then(res => res.data.session_id)


// implementation used reference from
// https://github.com/Tenpi/crunchyroll.ts/blob/master/entities/Anime.ts#L49
// and https://github.com/alzamer2/Crunchyroll-XML-Decoder-py3/blob/master/_Deprecation/crunchy-xml-decoder/altfuncs.py#L178
// export const searchSeries = ({ search, sessionId }: { search: string, sessionId: string }) =>
//   fetch(`https://api.crunchyroll.com/list_series.0.json`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     body: new URLSearchParams({
//       session_id : sessionId,
//       media_type : 'anime',
//       filter: `prefix:${search}`
//       // fields: 'series.url,series.series_id',
//       // limit: '1500'
//     })
//   }).then(res => res.json())

export const makePlayerEmbedSearchParams = (media_id: string) =>
  new URLSearchParams({
    // magic affiliate string, found this one on https://www.anime-planet.com/anime/fruits-basket-the-final-season/videos/253116
    // more info about affiliates here https://www.crunchyroll.com/forumtopic-800261/crunchyroll-affiliate-program-and-why
    aff: 'af-44915-aeey',
    media_id,
    video_format: '0',
    video_quality: '0',
    auto_play: '0'
  })

// iframe needs to have allow="encrypted-media" to be able to playback DRM content
// e.g: <iframe src="https://www.crunchyroll.com/affiliate_iframeplayer?aff=af-44915-aeey&amp;media_id=854993&amp;video_format=0&amp;video_quality=0&amp;auto_play=0" allow="encrypted-media"></iframe>

// example valid urls:
// https://www.crunchyroll.com/affiliate_iframeplayer?aff=af-44915-aeey&media_id=854993&video_format=0&video_quality=0&auto_play=0
// https://www.crunchyroll.com/affiliate_iframeplayer?aff=af-44915-aeey&media_id=778731&video_format=0&video_quality=0&auto_play=0
// https://www.crunchyroll.com/affiliate_iframeplayer?aff=af-44915-aeey&media_id=810793&video_format=0&video_quality=0&auto_play=0
// todo: these video IDs could be taken directly from MAL embedded episodes, e.g: https://myanimelist.net/anime/51837/Saikin_Yatotta_Maid_ga_Ayashii/episode/2
// todo: and we can know if an episode is premium only by checking for the crown icon on the episode list page, e.g: https://myanimelist.net/anime/51837/Saikin_Yatotta_Maid_ga_Ayashii/video
// todo: some episode IDs for some reason doesn't result in a valid video player, try to check why
export const getPlayerEmbedUrl = (id: string) =>
  `https://www.crunchyroll.com/affiliate_iframeplayer?${makePlayerEmbedSearchParams(id)}`

type SearchCandidateType = 'Series (Library Article)' | 'Person (Library Article)' | 'Series (SkyVision)' | ' (User-Created)'

type SearchCandidate = {
  type: SearchCandidateType
  id: `${number}`
  etp_guid: string
  name: string
  img: string
  link: string
}

let searchCandidates: Promise<SearchCandidate[]>

type SearchCandidateResult = {
  result_code: number
  message_list: []
  suggested_redirect_url: null
  data: SearchCandidate[]
  exception_class: null
  exception_error_code: null
}

export const getSearchCandidates = (fetch: FetchType) =>
  fetch('https://www.crunchyroll.com/ajax/?req=RpcApiSearch_GetSearchCandidates', { proxyRuntime: true })
    .then(res => res.text())
    .then(res => res.slice('/*-secure-\n'.length, -'\n*/'.length))
    .then(res => JSON.parse(res) as SearchCandidateResult)
    .then(res => res.data)

const getSeasonCardInfo = async (elem: HTMLElement, { fetch }: ExtraOptions): SeriesHandle => {
  if (!searchCandidates) searchCandidates = getSearchCandidates(fetch)

  const name = elem.querySelector('div > a > span:nth-child(2)[itemprop="name"]')!.textContent!.trim()!

  const id = (await searchCandidates).find(candidate => candidate.name === name)?.id!



  return (
    populateHandle({
      scheme,
      categories,
      id,
      url: elem.querySelector<HTMLAnchorElement>('div > a[itemprop="url"]')!.href,
      images: [{
        type: 'image' as const,
        size: 'small' as const,
        url: elem.querySelector<HTMLImageElement>('div > a > span.lineup-img-holder > img[itemprop="photo"]')!.src
      }],
      names: [{
        score: 1,
        language: LanguageTag.EN,
        name: name.trim()!
      }],
      handles: {
        edges: []
      },
      withDetails: false
    })
  )
}

export const getAnimeSeason = ({ fetch }: ExtraOptions) => {

  return (
    fetch('https://www.crunchyroll.com/lineup', { proxyRuntime: true })
      .then(async res => {
        const doc =
          new DOMParser()
            .parseFromString(await res.text(), 'text/html')

        const continuing =
          [
            ...[...doc.querySelectorAll('.anime-lineup-heading')]
              .filter(el => el.textContent === 'Continuing Simulcast Titles')
              .at(0)
              ?.nextElementSibling
              ?.nextElementSibling
              ?.querySelectorAll('#sortable li')
            ?? []
          ]
        const currentSeason =
          [
            ...[...doc.querySelectorAll('.anime-lineup-heading')]
              .filter(el => el.textContent === 'New Simulcast Titles')
              .at(0)
              ?.nextElementSibling
              ?.nextElementSibling
              ?.querySelectorAll('#sortable li')
            ?? []
          ]

        return (
          Promise.all(
            [
              ...continuing,
              ...currentSeason
            ]
              .map(item => getSeasonCardInfo(item, { fetch }))
          )
        )
      }
      )
      //todo: try to check if theres a way to get the anime ID even when it wasn't found in the searchCandidates list
      .then(res => res.filter(handle => handle.id))
  )
}

export const searchSeries: SearchSeries = ({ ...rest }, { fetch, ...extraOptions }) => {
  const throttledFetch: FetchType = throttle((...args) => fetch(...args))
  console.log('crunchy search')
  if ('latest' in rest && rest.latest) {
    return from(getAnimeSeason({ ...extraOptions, fetch: throttledFetch }))
  }
  // if ('search' in rest && typeof rest.search === 'string') {
  //   return from(searchAnime({ search: rest.search }, { ...extraOptions, fetch: throttledFetch }))
  // }
  return from([])
}
