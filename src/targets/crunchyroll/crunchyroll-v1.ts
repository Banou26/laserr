

// access_token and device_type taken from
// https://github.com/streamlink/streamlink/blob/867b9b3b66aab57c0fcb3ab117a275f29a23b71a/src/streamlink/plugins/crunchyroll.py#L102-L103
// https://github.com/streamlink/streamlink/issues/4453#issuecomment-1114520315
// If these break, we can get new ones from the Microsoft Store Crunchyroll application, or the android/ios mobile app
export const generateSessionId = () =>
  fetch(
    `https://api.crunchyroll.com/start_session.0.json?${
      new URLSearchParams({
        access_token: 'LNDJgOit5yaRIWN',
        device_type: 'com.crunchyroll.windows.desktop',
        device_id: Math.random().toString()
      })
    }`)
      .then(res => res.json())
      .then(res => res.data.session_id)


// implementation used reference from https://github.com/Tenpi/crunchyroll.ts/blob/master/entities/Anime.ts#L49
export const searchSeries = ({ search, sessionId }: { search: string, sessionId: string }) =>
  fetch(`https://api.crunchyroll.com/list_series.0.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      session_id : sessionId,
      media_type : 'anime',
      filter: `prefix:${search}`
      // fields: 'series.url,series.series_id',
      // limit: '1500'
    })
  }).then(res => res.json())

export const makePlayerEmbedSearchParams = (media_id: string) =>
  new URLSearchParams({
    // magic affiliate string, found this one on https://www.anime-planet.com/anime/fruits-basket-the-final-season/videos/253116
    // more info about affiliates here https://www.crunchyroll.com/forumtopic-800261/crunchyroll-affiliate-program-and-why
    aff: 'af-44915-aeey',
    media_id,
    video_format: '0',
    video_quality: '0',
    auto_play: '0'
  })

export const getPlayerEmbed = (id: string) =>
  `https://www.crunchyroll.com/affiliate_iframeplayer?${makePlayerEmbedSearchParams(id)}`
