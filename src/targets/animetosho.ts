import type { Handle, Resolvers } from 'scannarr'

import { populateUri } from 'scannarr'

import * as anidb from './anidb'
import { MediaEpisodePlayback } from '../generated/graphql'

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

// https://animetosho.org/search?filter%5B0%5D%5Bt%5D=nyaa_class&filter%5B0%5D%5Bv%5D=trusted&order=&q=1080&aid=14758
const searchAnime = ({ id, search }: { id: string, search: string }) =>
  new URLSearchParams({
    "filter[0][t]": "nyaa_class",
    "filter[0][v]": "trusted",
    "order": "",
    "q": search,
    "aid": id.toString()
  })

// https://animetosho.org/series/mushoku-tensei-isekai-ittara-honki-dasu.14758
const parseSeriesUrlId = (url: string) => url.split('.')[2]

// https://animetosho.org/view/erai-raws-mushoku-tensei-isekai-ittara-honki-dasu.n1361996
const parseTorrentUrlId = (url: string) => url.split('.')[2]

const entryToMediaEpisodePlayback = (elem: Element): MediaEpisodePlayback => {
  const torrentPageUrl = elem?.querySelector<HTMLAnchorElement>('.link a')?.href

  if (!torrentPageUrl) throw new Error('Animetosho, no torrent page link url found')


  return populateUri({
    id: parseTorrentUrlId(torrentPageUrl),
    origin,
    url: torrentPageUrl,
    handles: {
      edges: []
    }
  })
}

const getPlaybackElements = async (doc: Document) =>
  [...doc.body.querySelectorAll('.home_list_entry')]
  .map(entry => entryToMediaEpisodePlayback(entry))

export const resolvers: Resolvers = {
  Query: {
    Page: () => ({}),
    Episode: async (...args) => {
      const [_, { id: _id, origin: _origin }] = args
      if (_origin !== origin || !_id) return undefined
      console.log('AnimeTosho Episode', args, _id, _origin)
      return populateUri({
        origin: origin,
        id: _id,
        url: `https://animetosho.org/episode/_.${_id}`,
        handles: {
          edges: []
        },
        playback: {}
      })
    },
  },
  MediaEpisode: {
    playback: async (parent, args, context) => {
      const { id: _id, origin: _origin } = parent
      if (_origin !== origin || !_id) return undefined
      console.log('AnimeTosho MediaEpisode playback')

      const res = await context.fetch(
        `https://animetosho.org/search?${
          new URLSearchParams({
              "filter[0][t]": "nyaa_class",
              "filter[0][v]": "trusted",
              "order": "",
              "q": "1080",
              "aid": _id.toString()
          })
      }`)

      console.log('res', res)

      return undefined
    }
  }
} satisfies Resolvers
