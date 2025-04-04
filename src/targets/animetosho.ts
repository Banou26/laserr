import type { Handle, GraphQLTypes } from 'scannarr'

import type { Media, PlaybackSource } from '../generated/graphql'

import { parse } from 'node-html-parser'

import { fromScannarrUri, fromUri, populateHandle, isScannarrUri } from 'scannarr'

import * as anidb from './anidb'
import * as nyaa from './nyaasi'
import { parseUrlId as parseNyaaUrlId } from './nyaasi'

export const icon = 'https://animetosho.org/inc/favicon.ico'
export const originUrl = 'https://animetosho.org/'
export const origin = 'animetosho'
export const categories = ['ANIME']
export const name = 'AnimeTosho'
export const official = false
export const metadataOnly = false
export const supportedUris = ['animetosho']

export const fromRelatedHandle = (handle: Handle) => {
  if (handle.origin === anidb.origin) {
    return populateHandle({
      origin: anidb.origin,
      id: handle.id,
      url:
        handle.url?.includes('https://anidb.net/anime/') ? `https://animetosho.org/series/_.${handle.id}`
        : handle.url?.includes('https://anidb.net/episode/') ? `https://animetosho.org/episode/_.${handle.id}`
        : undefined,
      handles: []
    })
  }
}

// https://animetosho.org/search?filter%5B0%5D%5Bt%5D=nyaa_class&filter%5B0%5D%5Bv%5D=trusted&order=&q=1080&aid=14758
const searchAnime = (options: { id: string } | { search: string } | { id: string, search: string }) =>
  new URLSearchParams({
    "filter[0][t]": "nyaa_class",
    "filter[0][v]": "trusted",
    "order": "",
    // "qx": "1",
    ...'search' in options ? { "q": `${options.search} 1080` } : {},
    ...'id' in options ? { "aid": options.id } : {}
  }).toString()

// https://animetosho.org/series/mushoku-tensei-isekai-ittara-honki-dasu.14758
const parseSeriesUrlId = (url: string) => url.split('.')[2]

// https://animetosho.org/view/erai-raws-mushoku-tensei-isekai-ittara-honki-dasu.n1361996
const parseTorrentUrlId = (url: string) => url.split('.')[2]

const rowToPlaybackSource = (elem: Element): PlaybackSource => {
  const torrentPageElement = elem?.querySelector<HTMLAnchorElement>('.link a')
  if (!torrentPageElement) throw new Error('Animetosho, no torrent page link element found')

  const url = torrentPageElement?.getAttribute('href')
  if (!url) throw new Error('Animetosho, no torrent link url found on the torrent page link element')

  const filename = torrentPageElement?.textContent
  if (!filename) throw new Error('Animetosho, no torrent filename found on the torrent page link element')

  const timeElement = elem.querySelector<HTMLDivElement>('.date')
  if (!timeElement) throw new Error('Animetosho, no time element found')
  const timeString = timeElement.getAttribute('title')?.replace('Date/time submitted: ', '')
  if (!timeString) throw new Error('Animetosho, no title attribute on the time element found')
  let [day, month, year, hour, minute] = timeString.split(/\W/).filter(Boolean).map(Number)
  if (timeString.includes('Today') || timeString.includes('Yesterday')) {
    const now = new Date(timeString.includes('Yesterday') ? Date.now() - 1000 * 60 * 60 * 24 : Date.now())
    day = now.getDate()
    month = now.getMonth()
    year = now.getFullYear()
    const [hourStr, minStr] = timeString.split(' ')[1]?.split(':') ?? [0, 0]
    hour = Number(hourStr)
    minute = Number(minStr)
  }
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

  const name = elem.querySelector('.serieslink')?.textContent // ?? elem.ownerHTMLElement.querySelector('#title')?.textContent
  if (!name) throw new Error('Animetosho, no torrent name found on the torrent page link element')

  const magnetUri = elem.querySelector<HTMLAnchorElement>('a[href^="magnet"]')?.getAttribute('href')
  if (!magnetUri) throw new Error('Animetosho, no magnet uri found on the torrent page link element')

  const torrentUrl = elem.querySelector<HTMLAnchorElement>('div.links > a.dllink')?.getAttribute('href')
  if (!torrentUrl) throw new Error('Animetosho, no torrent url found on the torrent page link element')

  const teamWebsite = elem.querySelector<HTMLAnchorElement>('div.links > .links_right > .misclinks > a')?.getAttribute('href')

  const sourceElem = elem.querySelector<HTMLAnchorElement>('div.links > span.links_right > span.misclinks > span.numcomments > a[title^="Nyaa"]')
  const sourceUrl = sourceElem?.getAttribute('href')
  const sourceName = sourceElem?.textContent

  const sourceHandle =
    sourceElem &&
    sourceUrl &&
    parseNyaaUrlId(sourceUrl) &&
    {
      ...populateHandle({
        id: parseNyaaUrlId(sourceUrl)!.toString(),
        origin: nyaa.origin,
        url: sourceUrl,
        handles: []
      }),
      title: {
        romanized: undefined,
        english: undefined,
        native: undefined
      },
      team:
        teamWebsite
          ? populateHandle({
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
    }

  return populateHandle({
    id: parseTorrentUrlId(url)!,
    origin,
    url,
    handles:
      sourceHandle
        ? [sourceHandle]
        : [],
    title: {
      romanized: undefined,
      english: undefined,
      native: undefined
    },
    team:
      teamWebsite
        ? populateHandle({
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

const getListRows = (doc: HTMLElement) => [...doc.querySelectorAll('.home_list_entry')]

const getListRowsAsPlaybackSource = (doc: HTMLElement) =>
  getListRows(doc)
    .map(rowToPlaybackSource)

const searchPlaybackSources = async (options: { search: string, id?: string }, { fetch = window.fetch }) =>
  fetch(`https://animetosho.org/search?${searchAnime(options)}`)
    .then(res => res.text())
    .then(text => parse(text) as unknown as HTMLElement)
    .then(getListRowsAsPlaybackSource)

const seriesPageToMedia = (doc: HTMLElement): Media => {
  const urlElement = doc.querySelector<HTMLAnchorElement>('#content > div:nth-child(3) > a')
  if (!urlElement) throw new Error('Animetosho, no url element found')
  const url = urlElement.getAttribute('href')?.replace(new URL(urlElement.getAttribute('href')!).search, '')

  const titleElement = doc.querySelector<HTMLHeadingElement>('#title')
  if (!titleElement) throw new Error('Animetosho, no title element found')
  const title = titleElement?.textContent
  if (!title) throw new Error('Animetosho, no title textContent found')

  const descriptionElement = doc.querySelector<HTMLDivElement>('#content > table > tbody > tr > td > div:nth-child(2)')
  if (!descriptionElement) throw new Error('Animetosho, no description element found')
  const description = descriptionElement?.innerHTML
  if (!description) throw new Error('Animetosho, no description textContent found')

  const imageElement = doc.querySelector<HTMLImageElement>('#content > table > tbody > tr > td > a > img')
  if (!imageElement) throw new Error('Animetosho, no image element found')
  const image = imageElement?.getAttribute('src')
  if (!image) throw new Error('Animetosho, no image src found')

  const id = url && parseSeriesUrlId(url)

  if (!id) throw new Error('Animetosho, no id found')

  return populateHandle({
    origin,
    id,
    url,
    // todo: add related handles
    handles: [],
    title: {
      native: null,
      romanized: title,
      english: null
    },
    description,
    coverImage: [{
      medium: image
    }],
    episodes: []
    // episodes: {
    //   edges: []
    //   // edges: getListRowsAsPlaybackSource(doc)
    // }
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
    .then(text => parse(text))
    .then(seriesPageToMedia)


const torrentToPlaybackSource = (doc: HTMLElement): PlaybackSource => {
  const urlElement = doc.querySelector<HTMLAnchorElement>('#newcomment')
  if (!urlElement) throw new Error('Animetosho, no url element found')
  const url =
    urlElement
      .getAttribute('action')
      ?.replace(new URL(urlElement?.href).hash, '')
  if (!url) throw new Error('Animetosho, no url href found')

  const titleElement = doc.querySelector<HTMLAnchorElement>('#nav_bc > a:nth-child(2)')
  if (!titleElement) throw new Error('Animetosho, no title element found')
  const title = titleElement?.textContent
  if (!title) throw new Error('Animetosho, no title textContent found')

  const filenameElement = doc.querySelector<HTMLAnchorElement>('.title')
  if (!filenameElement) throw new Error('Animetosho, no filename element found')
  const filename = filenameElement?.textContent
  if (!filename) throw new Error('Animetosho, no filename textContent found')

  const timeElement = doc.querySelector<HTMLDivElement>('#content > table:nth-child(3) > tbody > tr:nth-child(2) > td')
  if (!timeElement) throw new Error('Animetosho, no time element found')
  const timeString = timeElement?.textContent
  if (!timeString) throw new Error('Animetosho, no time textContent found')

  const thumbnails =
    [...doc.querySelectorAll<HTMLAnchorElement>('.screenthumb')]
      .map(img => img.href)

  const bytesElement = doc.querySelector<HTMLDivElement>('#content > table:nth-child(4) > tbody > tr:nth-child(1) > td > span')
  if (!bytesElement) throw new Error('Animetosho, no bytes element found')
  const bytesString =
    bytesElement
      .getAttribute('title')
      ?.replace('Total file size: ', '')
      .replace(' bytes', '')
      .replaceAll(',', '')
  if (!bytesString) throw new Error('Animetosho, no bytes textContent found')
  const bytes = Number(bytesString)

  const dateElement = doc.querySelector<HTMLDivElement>('#content > table:nth-child(3) > tbody > tr:nth-child(2) > td')
  if (!dateElement) throw new Error('Animetosho, no date element found')
  const dateString = dateElement?.textContent
  if (!dateString) throw new Error('Animetosho, no date textContent found')
  const uploadDate = new Date(dateString)

  return populateHandle({
    id: parseTorrentUrlId(url),
    origin,
    url: url,
    handles: [],
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

export const resolvers: GraphQLTypes.Resolvers = {
  Subscription: {
    media: {
      subscribe: async function*(_, { input: { uri } }, ctx) {
        if (!uri) return
        const uriValues =
          isScannarrUri(uri)
            ? (
              fromScannarrUri(uri)
                ?.handleUrisValues
                .find(({ origin: _origin }) => _origin === origin || _origin === anidb.origin)
            )
            : fromUri(uri)
        if (!uriValues || (uriValues.origin !== origin && uriValues.origin !== anidb.origin)) return
        yield {
          media: await fetchSeriesPageMedia(uriValues.id, ctx)
        }
      }
    },
    episode: {
      subscribe: async function*(_, { input: { uri } }, ctx) {
        if (!uri) return
        const uriValues =
          isScannarrUri(uri)
            ? (
              fromScannarrUri(uri)
                ?.handleUrisValues
                .find(({ origin: _origin }) => _origin === origin || _origin === anidb.origin)
            )
            : fromUri(uri)
        if (!uriValues || (uriValues.origin !== origin && uriValues.origin !== anidb.origin)) return
        yield {
          episode: populateHandle({
            origin: origin,
            id: uriValues.id,
            url: `https://animetosho.org/episode/_.${uriValues.id}`,
            handles: [],
            playback: {}
          })
        }
      }
    },
    playbackSourcePage: {
      subscribe: async function*(_, { input: { uri, number } }, ctx) {
        if (!uri) return
        const uriValues =
          isScannarrUri(uri)
            ? (
              fromScannarrUri(uri)
                ?.handleUrisValues
                .find(({ origin: _origin }) => _origin === origin || _origin === anidb.origin)
            )
            : fromUri(uri)
        if (!uriValues || (uriValues.origin !== origin && uriValues.origin !== anidb.origin)) return
        yield {
          playbackSourcePage: {
            nodes: number !== undefined && number !== null
              ? await searchPlaybackSources({ id: uriValues.id, search: number.toString().padStart(2, '0') }, ctx)
              : await fetchTorrentPagePlaybackSources(uriValues.id, ctx)
          }
        }
      }
    }
  }
} satisfies GraphQLTypes.Resolvers
