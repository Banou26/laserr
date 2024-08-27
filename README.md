## Laserr
*TL;DR A web version of [Jackett](https://github.com/Jackett/Jackett)*

Laserr is a media indexer/scraper library including a list of plugins transforming API calls into tracker-site-specific http queries, parses the responses and return the results. This allows for getting recent, search & categorized results.

Each supported website/source is called Target, it is either a single typescript file or a folder with at least an index typescript file. It is registered by adding it to the root index file that registers all Targets and expose them.


TODO:
https://beta.releases.moe/
support https://github.com/erengy/anime-relations
make use of the https://trash-guides.info/Sonarr/Sonarr-Release-Profile-RegEx-Anime/#must-not-contain ?
support Jackett definitions: https://github.com/Jackett/Jackett/tree/master/src/Jackett.Common/Definitions

video sources like 9anime ect
https://github.com/justfoolingaround/animdl/tree/master/animdl/core/codebase/extractors/vidstream
https://github.com/justfoolingaround/animdl/animdl/core/codebase/providers/nineanime/init.py
https://github.com/justfoolingaround/animdl/animdl/core/codebase/extractors/vidstream/init.py

https://anify.tv/
https://consumet.org/ https://github.com/consumet/api.consumet.org
https://docs.enime.moe/ https://api.enime.moe/mapping/anilist/1 https://docs.enime.moe/ https://github.com/Enime-Project/api.enime.moe

https://mirror.animetosho.org/
https://animetosho.org/animes/anidbID
https://animetosho.org/episodes/aniDBepisodeID
https://feed.animetosho.org/json?t=search&cat=5070&extended=1&offset=0&limit=75&q=Uchuu%20Senkan%20Tiramisu+01

Waaiez — Today at 10:32 PM
Going by
https://github.com/theotherp/nzbhydra2/issues/147

someone suggests using 
https://animetosho.org/feed/api?t=search&cat=5070&extended=1&offset=0&limit=75&q=Uchuu%20Senkan%20Tiramisu+01

https://animetosho.org/about talks about a json api being available if you swap api with json

so 
https://animetosho.org/feed/json?t=search&cat=5070&extended=1&offset=0&limit=75&q=Uchuu%20Senkan%20Tiramisu+01 will work

https://animetosho.org/episode/mashle-8.266011
https://animetosho.org/episode/_.ANIDB_EPISODE_ID_HERE


looking at https://storage.animetosho.org/dbexport/
it makes mention of aid, eid (and others) relating to anidb (check what they mean with the link)

so just messing around with the urls I found
https://feed.animetosho.org/json?t=search&cat=5070&extended=1&offset=0&limit=75&aid=12681 uses aid which is the anidb id for an anime (this is searching for made in abyss)

https://feed.animetosho.org/json?t=search&cat=5070&extended=1&offset=0&limit=75&eid=188559 uses eid for the anidb episode id (this is searching for made in abyss episode 1)

https://chiaki.site/?/tools/watch_order

https://thetvdb.com/api-information

https://discord.com/channels/953341991134064651/1001493036573925416/1121392357842112603

trailer thumbnail thru YT api: https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=xMZQ9s1lU2M&format=json


https://discord.com/channels/953341991134064651/1001493036573925416/1121829231748468796

https://skyhook.sonarr.tv/v1/tvdb/shows/en/421069

https://thexem.info/
https://thexem.info/xem/show/5632


https://github.com/Enime-Project/api.enime.moe/blob/dev/src/mapping/meta/meta.service.ts#L19
https://github.com/Enime-Project/api.enime.moe/blob/dev/src/mapping/meta/impl/tvdb.ts#L21

https://api.ani.zip/mappings?anidb_id=11712

https://www.jsonapi.co/public-api/category/Anime

https://www.crunchyroll.com/ajax/?req=RpcApiSearch_GetSearchCandidates

https://www.opensubtitles.org/fr/ssearch/sublanguageid-/idmovie-546206

https://newznab.readthedocs.io/en/latest/misc/api/#list-of-attributes
https://www.techradar.com/best/best-nzb-indexing-websites
https://theindex.moe/library/anime
https://theindex.moe/
https://github.com/popcorn-time-ru/popcorn-ru
https://awesomeopensource.com/projects/radarr

https://fanarttv.docs.apiary.io/#
https://trakt.tv/
https://www.tvtime.com/
https://www.imdb.com/
https://www.themoviedb.org/
https://eztv.wf/
https://torrends.to/settings/#search_url
https://torrends.info/
https://thetvdb.com/
https://github.com/JimmyLaurent/torrent-search-api
