## Laserr
*TL;DR A web version of [Jackett](https://github.com/Jackett/Jackett)*

Laserr is a media indexer/scraper library including a list of plugins transforming API calls into tracker-site-specific http queries, parses the responses and return the results. This allows for getting recent, search & categorized results.

Each supported website/source is called Target, it is either a single typescript file or a folder with at least an index typescript file. It is registered by adding it to the root index file that registers all Targets and expose them.
