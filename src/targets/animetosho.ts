import type { Handle, Resolvers } from 'scannarr'

import { populateUri } from 'scannarr'

import * as anidb from './anidb'

export const icon = 'https://animetosho.org/inc/favicon.ico'
export const originUrl = 'https://animetosho.org/'
export const origin = 'animetosho'
export const categories = ['ANIME']
export const name = 'AnimeTosho'
export const official = false
export const metadataOnly = false

export const fromRelatedHandle = (handle: Handle) => {
  if (handle.origin === anidb.origin) {
    return populateUri({
      origin: anidb.origin,
      id: handle.id,
      url:
        handle.url?.includes('https://anidb.net/anime/') ? `https://animetosho.org/series/_.${handle.id}`
        : handle.url?.includes('https://anidb.net/episode/') ? `https://animetosho.org/episode/_.${handle.id}`
        : undefined,
      handles: {
        edges: []
      }
    })
  }
}

export const resolvers: Resolvers = {

} satisfies Resolvers
