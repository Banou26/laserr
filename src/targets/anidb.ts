
// rate limit information: https://www.filebot.net/forums/viewtopic.php?p=51568&sid=fe0b5b0b17fda79b108b396f7a0b1f5b#p51568
// FileBot r7750 implements various new behaviors and now things work as follows:
// * No more than one active request at any point in time
// * No more than 5 requests within a 1 minute time frame (i.e. the first 5 requests are very fast, one after another, but the 6th request will have to wait for ~60 seconds, heavily slowing down processing)
// * No more than 200 request per 24 hour time frame (i.e. the first 200 requests will be relatively fast at 5 requests per 60 seconds, but if we hit the limit, then FileBot will deadlock and suspend processing for up to 24 hours)
// * All information is cached for 6 days (i.e. FileBot will not request the same information twice, unless the information we have is more than 6 days old already)
// * If our 200 request per 24 hour limit is 50% exhausted, then FileBot will prefer previously cached information regardless of age to conserve requests if possible (i.e. you may end up with episode data that is 2-3 months old that was cached in a previous run long ago)
// * A single banned response will switch the AniDB client into offline mode for the remaining process life-time and all subsequent requests that cannot be served by the cache will fail immediately


import type { Handle, Resolvers } from 'scannarr'

import { populateHandle } from 'scannarr'

import * as AT from './animetosho'

export const icon = 'https://cdn-eu.anidb.net/css/assets/images/touch/apple-touch-icon.png'
export const originUrl = 'https://anidb.net/'
export const origin = 'anidb'
export const categories = ['ANIME']
export const name = 'AniDB'
export const official = true
export const metadataOnly = true

// export const fromRelatedHandle = (handle: Handle) => {
//   if (handle.origin === AT.origin) {
//     return populateHandle({
//       origin: AT.origin,
//       id: handle.id,
//       url:
//         handle.url?.includes('https://animetosho.org/series/') ? `https://anidb.net/anime/${handle.id}`
//         : handle.url?.includes('https://animetosho.org/episode/') ? `https://anidb.net/episode/${handle.id}`
//         : undefined,
//       handles: {
//         edges: []
//       }
//     })
//   }
// }


export const resolvers: Resolvers = {

} satisfies Resolvers
