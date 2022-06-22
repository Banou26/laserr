import type { Target } from '../../../scannarr/src'

import * as MAL from './myanimelist'
import * as Nyaasi from './nyaasi'
import * as Anilist from './anilist'

export const targets: Target[] = [
  MAL,
  Nyaasi,
  Anilist
]
