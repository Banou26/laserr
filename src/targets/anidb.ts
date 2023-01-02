
// rate limit information: https://www.filebot.net/forums/viewtopic.php?p=51568&sid=fe0b5b0b17fda79b108b396f7a0b1f5b#p51568
// FileBot r7750 implements various new behaviors and now things work as follows:
// * No more than one active request at any point in time
// * No more than 5 requests within a 1 minute time frame (i.e. the first 5 requests are very fast, one after another, but the 6th request will have to wait for ~60 seconds, heavily slowing down processing)
// * No more than 200 request per 24 hour time frame (i.e. the first 200 requests will be relatively fast at 5 requests per 60 seconds, but if we hit the limit, then FileBot will deadlock and suspend processing for up to 24 hours)
// * All information is cached for 6 days (i.e. FileBot will not request the same information twice, unless the information we have is more than 6 days old already)
// * If our 200 request per 24 hour limit is 50% exhausted, then FileBot will prefer previously cached information regardless of age to conserve requests if possible (i.e. you may end up with episode data that is 2-3 months old that was cached in a previous run long ago)
// * A single banned response will switch the AniDB client into offline mode for the remaining process life-time and all subsequent requests that cannot be served by the cache will fail immediately
