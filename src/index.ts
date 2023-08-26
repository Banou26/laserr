import { Handle } from './generated/graphql'
import { targets } from './targets'

export * from './targets'

export const urlToHandle = (url: string): Handle | undefined =>
  targets
    .find(target => url.startsWith(target.originUrl))
    ?.urlToHandle
    ?.(url)

export const handleToUrl = (handle: Handle): string | undefined =>
  targets
    .find(target => target.origin === handle.origin)
    ?.handleToUrl
    ?.(handle)
