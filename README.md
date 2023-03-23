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
