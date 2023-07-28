import type { Handle, Resolvers } from 'scannarr'

import { populateUri } from 'scannarr'

import * as anidb from './anidb'
import { Media, PlaybackSource } from '../generated/graphql'

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
const searchAnime = (options: { id: string } | { search: string } | { id: string, search: string }) =>
  new URLSearchParams({
    "filter[0][t]": "nyaa_class",
    "filter[0][v]": "trusted",
    "order": "",
    "qx": "1",
    ...'search' in options ? { "q": `${options.search}<<(1080|720|480)` } : {},
    ...'id' in options ? { "aid": options.id } : {}
  }).toString()

// https://animetosho.org/series/mushoku-tensei-isekai-ittara-honki-dasu.14758
const parseSeriesUrlId = (url: string) => url.split('.')[2]

// https://animetosho.org/view/erai-raws-mushoku-tensei-isekai-ittara-honki-dasu.n1361996
const parseTorrentUrlId = (url: string) => url.split('.')[2]

const rowToPlaybackSource = (elem: Element): PlaybackSource => {
  const torrentPageElement = elem?.querySelector<HTMLAnchorElement>('.link a')
  if (!torrentPageElement) throw new Error('Animetosho, no torrent page link element found')

  const url = torrentPageElement?.href
  if (!url) throw new Error('Animetosho, no torrent link url found on the torrent page link element')

  const filename = torrentPageElement?.textContent
  if (!filename) throw new Error('Animetosho, no torrent filename found on the torrent page link element')

  const timeElement = elem.querySelector<HTMLDivElement>('.date')
  if (!timeElement) throw new Error('Animetosho, no time element found')
  const timeString = timeElement.getAttribute('title')?.replace('Date/time submitted: ', '')
  if (!timeString) throw new Error('Animetosho, no title attribute on the time element found')
  const [day, month, year, hour, minute] = timeString.split(/\W/).filter(Boolean).map(Number)
  if (day === undefined || month === undefined || year === undefined || hour === undefined || minute === undefined) {
    throw new Error('Animetosho, invalid time string')
  }
  const uploadDate = Date.UTC(year, month, day, hour, minute)
  const bytesElement = elem.querySelector('.size')
  if (!bytesElement) throw new Error('Animetosho, no bytes element found')
  const bytesString =
    bytesElement
      .getAttribute('title')
      ?.replace('Total file size: ', '')
      .replace(' bytes', '')
      .replaceAll(',', '')
  if (!bytesString) throw new Error('Animetosho, no title attribute on the bytes element found')
  const bytes = Number(bytesString)

  const name = elem.querySelector('.serieslink')?.textContent ?? elem.ownerDocument.querySelector('#title')?.textContent
  if (!name) throw new Error('Animetosho, no torrent name found on the torrent page link element')

  const magnetUri = elem.querySelector<HTMLAnchorElement>('a[href^="magnet"]')?.href
  if (!magnetUri) throw new Error('Animetosho, no magnet uri found on the torrent page link element')

  const torrentUrl = elem.querySelector<HTMLAnchorElement>('div.links > a.dllink')?.href
  if (!torrentUrl) throw new Error('Animetosho, no torrent url found on the torrent page link element')

  const teamWebsite = elem.querySelector<HTMLAnchorElement>('div.links > .links_right > .misclinks > a')?.href

  return populateUri({
    id: parseTorrentUrlId(url),
    origin,
    url,
    handles: {
      edges: []
    },
    team:
      teamWebsite
        ? populateUri({
          id: `${parseTorrentUrlId(url)}-website`,
          origin,
          url: teamWebsite
        })
        : undefined,
    filename,
    name,
    uploadDate,
    bytes,
    data: JSON.stringify({
      magnetUri,
      torrentUrl
    })
  })
}

const getListRows = (doc: Document) => [...doc.body.querySelectorAll('.home_list_entry')]

const getListRowsAsPlaybackSource = (doc: Document) =>
  getListRows(doc)
    .map(rowToPlaybackSource)

const searchPlaybackSources = async (options: { search: string, id?: string }, { fetch = window.fetch }) =>
  fetch(`https://animetosho.org/search?${searchAnime(options)}`)
    .then(res => res.text())
    .then(text => new DOMParser().parseFromString(text, 'text/html'))
    .then(getListRowsAsPlaybackSource)

const seriesPageToMedia = (doc: Document): Media => {
  const urlElement = doc.body.querySelector<HTMLAnchorElement>('#content > div:nth-child(3) > a')
  if (!urlElement) throw new Error('Animetosho, no url element found')
  const url = urlElement?.href.replace(new URL(urlElement?.href).search, '')

  const titleElement = doc.body.querySelector<HTMLHeadingElement>('#title')
  if (!titleElement) throw new Error('Animetosho, no title element found')
  const title = titleElement?.textContent
  if (!title) throw new Error('Animetosho, no title textContent found')

  const descriptionElement = doc.body.querySelector<HTMLDivElement>('#content > table > tbody > tr > td > div:nth-child(2)')
  if (!descriptionElement) throw new Error('Animetosho, no description element found')
  const description = descriptionElement?.innerHTML
  if (!description) throw new Error('Animetosho, no description textContent found')

  const imageElement = doc.body.querySelector<HTMLImageElement>('#content > table > tbody > tr > td > a > img')
  if (!imageElement) throw new Error('Animetosho, no image element found')
  const image = imageElement?.src
  if (!image) throw new Error('Animetosho, no image src found')

  return populateUri({
    origin,
    id: parseSeriesUrlId(url),
    url,
    // todo: add related handles
    handles: {
      edges: []
    },
    title: {
      native: null,
      romanized: title,
      english: null
    },
    description,
    coverImage: [{
      medium: image
    }],
    episodes: {
      edges: []
      // edges: getListRowsAsPlaybackSource(doc)
    }
  })
}

// const fetchSeriesPage = async (url: string) => {
//   const text = await (await fetch(url)).text()
//   const doc = new DOMParser().parseFromString(text, 'text/html')
//   return seriesPageToMedia(doc)
// }

// const fetchSeriesPageMedia = (url: string, { fetch = window.fetch }) =>
//   fetch(url)
//     .then(res => res.text())
//     .then(text => new DOMParser().parseFromString(text, 'text/html'))
//     .then(seriesPageToMedia)

const fetchSeriesPageMedia = (id: number, { fetch = window.fetch }) =>
  fetch(`https://animetosho.org/series/_.${id}`)
    .then(res => res.text())
    .then(text => new DOMParser().parseFromString(text, 'text/html'))
    .then(seriesPageToMedia)


const torrentToPlaybackSource = (doc: Document): PlaybackSource => {
  const urlElement = doc.body.querySelector<HTMLAnchorElement>('#newcomment')
  if (!urlElement) throw new Error('Animetosho, no url element found')
  const url =
    urlElement
      .getAttribute('action')
      ?.replace(new URL(urlElement?.href).hash, '')
  if (!url) throw new Error('Animetosho, no url href found')

  const titleElement = doc.body.querySelector<HTMLAnchorElement>('#nav_bc > a:nth-child(2)')
  if (!titleElement) throw new Error('Animetosho, no title element found')
  const title = titleElement?.textContent
  if (!title) throw new Error('Animetosho, no title textContent found')

  const filenameElement = doc.body.querySelector<HTMLAnchorElement>('.title')
  if (!filenameElement) throw new Error('Animetosho, no filename element found')
  const filename = filenameElement?.textContent
  if (!filename) throw new Error('Animetosho, no filename textContent found')

  const timeElement = doc.body.querySelector<HTMLDivElement>('#content > table:nth-child(3) > tbody > tr:nth-child(2) > td')
  if (!timeElement) throw new Error('Animetosho, no time element found')
  const timeString = timeElement?.textContent
  if (!timeString) throw new Error('Animetosho, no time textContent found')

  const thumbnails =
    [...doc.body.querySelectorAll<HTMLAnchorElement>('.screenthumb')]
      .map(img => img.href)

  const bytesElement = doc.body.querySelector<HTMLDivElement>('#content > table:nth-child(4) > tbody > tr:nth-child(1) > td > span')
  if (!bytesElement) throw new Error('Animetosho, no bytes element found')
  const bytesString =
    bytesElement
      .getAttribute('title')
      ?.replace('Total file size: ', '')
      .replace(' bytes', '')
      .replaceAll(',', '')
  if (!bytesString) throw new Error('Animetosho, no bytes textContent found')
  const bytes = Number(bytesString)

  const dateElement = doc.body.querySelector<HTMLDivElement>('#content > table:nth-child(3) > tbody > tr:nth-child(2) > td')
  if (!dateElement) throw new Error('Animetosho, no date element found')
  const dateString = dateElement?.textContent
  if (!dateString) throw new Error('Animetosho, no date textContent found')
  const uploadDate = new Date(dateString)

  return populateUri({
    id: parseTorrentUrlId(url),
    origin,
    url: url,
    handles: {
      edges: []
    },
    filename,
    title: {
      native: null,
      romanized: title,
      english: null
    },
    uploadDate,
    bytes,
    thumbnails
  })
}

const fetchTorrentPage = (url: string, { fetch = window.fetch }) =>
  fetch(url)
    .then(res => res.text())
    .then(text => new DOMParser().parseFromString(text, 'text/html'))
    .then(torrentToPlaybackSource)

const fetchTorrentPagePlaybackSources = (id: number, { fetch = window.fetch }) =>
  fetch(`https://animetosho.org/series/_.${id}`)
    .then(res => res.text())
    .then(text => new DOMParser().parseFromString(text, 'text/html'))
    .then(getListRowsAsPlaybackSource)

export const resolvers: Resolvers = {
  Page: {
    playbackSource: async (...args) => {
      const [_, { id: _id, origin: _origin, number }, { fetch }] = args
      console.log('AnimeTosho playbackSource', args)
      if (_origin !== origin || !_id) return []
      console.log('AnimeTosho playbackSource CHECK PASSED')
      // const res = await searchPlaybackSources({ id: _id }, { fetch })
      const res =
        number !== undefined
          ? await searchPlaybackSources({ id: _id, search: number.toString().padStart(2, '0') }, { fetch })
          : await fetchTorrentPagePlaybackSources(_id, { fetch })
      console.log('AnimeTosho playbackSource RESSSSS', args, _id, _origin, res)
      return res ?? []
    }
  },
  Query: {
    Page: () => ({}),
    Media: async (...args) => {
      const [_, { id: _id, origin: _origin }, { fetch }] = args
      if (_origin !== origin || !_id) return undefined
      // if (!(_origin === origin || _origin === anidb.origin) || !_id) return undefined
      return fetchSeriesPageMedia(_id, { fetch })
    },
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
    // PlaybackSource: async (...args) => {
    //   const [_, { id: _id, origin: _origin }, { fetch }] = args
    //   if (_origin !== origin || !_id) return undefined
    //   const res = await searchPlaybackSources(_id, { fetch })
    //   console.log('AnimeTosho PlaybackSource', args, _id, _origin, res)
    //   return res
    // }
  },
  Episode: {
    playback: async (parent, args, context) => {
      const { id: _id, origin: _origin } = parent
      if (_origin !== origin || !_id) return undefined
      console.log('AnimeTosho Episode playback')

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
