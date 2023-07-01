import type { Target } from 'scannarr'

import * as MAL from './myanimelist'
import * as Nyaasi from './nyaasi'
import * as Anilist from './anilist'
import * as AniDB from './anidb'
import * as Crunchyroll from './crunchyroll'
import * as AnimeTosho from './animetosho'

export const targets: Target[] = [
  MAL,
  Nyaasi,
  Anilist,
  AniDB,
  Crunchyroll,
  AnimeTosho
]
