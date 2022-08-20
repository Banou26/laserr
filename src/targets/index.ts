import type { Target } from '../../../scannarr/src'

import * as MAL from './myanimelist'
import * as Nyaasi from './nyaasi'
import * as Anilist from './anilist'
import * as Crunchyroll from './crunchyroll'

export const targets: Target[] = [
  MAL,
  Nyaasi,
  Anilist,
  Crunchyroll
]
