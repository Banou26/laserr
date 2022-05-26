import { Handle } from 'scannar/src/types/handle'

export const fromUri = (uri: string) => {
  const [scheme, id] = uri.split(':')
  return { scheme, id }
}

export const toUri = ({ scheme, id }: { scheme: string, id: string }) => `${scheme}:${id}`

export const populateUri = <T extends Partial<Pick<Handle, 'uri'>> & Omit<Handle, 'uri'>>(handle: T): T & Handle => ({
  ...handle,
  uri: toUri({ scheme: handle.scheme, id: handle.id })
})
