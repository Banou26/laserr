## Laserr
*TL;DR A web version of [Jackett](https://github.com/Jackett/Jackett)*

Laserr is a media indexer/scraper library including a list of plugins transforming API calls into tracker-site-specific http queries, parses the responses and return the results. This allows for getting recent, search & categorized results.

Each supported website/source is called Target, it is either a single typescript file or a folder with at least an index typescript file. It is registered by adding it to the root index file that registers all Targets and expose them.


TODO: 
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


looking at https://storage.animetosho.org/dbexport/
it makes mention of aid, eid (and others) relating to anidb (check what they mean with the link)

so just messing around with the urls I found
https://feed.animetosho.org/json?t=search&cat=5070&extended=1&offset=0&limit=75&aid=12681 uses aid which is the anidb id for an anime (this is searching for made in abyss)

https://feed.animetosho.org/json?t=search&cat=5070&extended=1&offset=0&limit=75&eid=188559 uses eid for the anidb episode id (this is searching for made in abyss episode 1)
