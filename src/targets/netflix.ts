import type { Handle } from 'scannarr'
import { populateHandle } from 'scannarr'

export const icon = 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.png'
export const originUrl = 'https://www.netflix.com'
export const categories: Category[] = ['ANIME']
export const name = 'Netflix'
export const origin = 'nflx'
export const official = true
export const metadataOnly = false
export const supportedUris = ['nflx']

export const urlToHandle = (url: string) => {
  // const match = url.match(/netflix\.com\/watch\/(\d+)/)
  const match = url.match(/netflix\.com\/title\/(\d+)/)
  if (!match) return null

  return populateHandle({ origin: 'mal', id: match[1], url })
}

export const handleToUrl = (handle: Handle) => `https://www.netflix.com/title/${handle.id}`
