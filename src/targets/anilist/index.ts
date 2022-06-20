import type { SearchSeries } from '../../../../scannarr/src'
import { MediaSeason, MediaFormat } from './types'

import { from } from 'rxjs'

const searchQuery = `query (
	$season: MediaSeason,
	$year: Int,
	$format: MediaFormat,
	$excludeFormat: MediaFormat,
	$status: MediaStatus,
	$minEpisodes: Int,
	$page: Int,
){
	Page(page: $page) {
		pageInfo {
			hasNextPage
			total
		}
		media(
			season: $season
			seasonYear: $year
			format: $format,
			format_not: $excludeFormat,
			status: $status,
			episodes_greater: $minEpisodes,
			isAdult: false,
			type: ANIME,
			sort: TITLE_ROMAJI,
		) {
            
      id
      idMal
      title {
        romaji
        native
        english
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      status
      season
      format
      genres
      synonyms
      duration
      popularity
      episodes
      source(version: 2)
      countryOfOrigin
      hashtag
      averageScore
      siteUrl
      description
      bannerImage
      isAdult
      coverImage {
        extraLarge
        color
      }
      trailer {
        id
        site
        thumbnail
      }
      externalLinks {
        site
        url
      }
      rankings {
        rank
        type
        season
        allTime
      }
      studios(isMain: true) {
        nodes {
          id
          name
          siteUrl
        }
      }
      relations {
        edges {
          relationType(version: 2)
          node {
            id
            title {
              romaji
              native
              english
            }
            siteUrl
          }
        }
      }

      airingSchedule(
        notYetAired: true
        perPage: 2
      ) {
        nodes {
          episode
          airingAt
        }
      }

		}
	}
}`


const seasonVariables = {season: "SUMMER", year: 2022, format: "TV", page: 1}
const seasonVariables2 = {season: "SUMMER", year: 2022, excludeFormat: "TV", page: 1}
const seasonVariables3 = {season: "SPRING", year: 2022, minEpisodes: 16, page: 1}

fetch("https://graphql.anilist.co/", {
  "headers": {
    "content-type": "application/json"
  },
  "referrer": "https://anichart.net/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "{\"query\":\"query (\\n\\t$season: MediaSeason,\\n\\t$year: Int,\\n\\t$format: MediaFormat,\\n\\t$excludeFormat: MediaFormat,\\n\\t$status: MediaStatus,\\n\\t$minEpisodes: Int,\\n\\t$page: Int,\\n){\\n\\tPage(page: $page) {\\n\\t\\tpageInfo {\\n\\t\\t\\thasNextPage\\n\\t\\t\\ttotal\\n\\t\\t}\\n\\t\\tmedia(\\n\\t\\t\\tseason: $season\\n\\t\\t\\tseasonYear: $year\\n\\t\\t\\tformat: $format,\\n\\t\\t\\tformat_not: $excludeFormat,\\n\\t\\t\\tstatus: $status,\\n\\t\\t\\tepisodes_greater: $minEpisodes,\\n\\t\\t\\tisAdult: false,\\n\\t\\t\\ttype: ANIME,\\n\\t\\t\\tsort: TITLE_ROMAJI,\\n\\t\\t) {\\n\\t\\t\\t\\nid\\nidMal\\ntitle {\\n\\tromaji\\n\\tnative\\n\\tenglish\\n}\\nstartDate {\\n\\tyear\\n\\tmonth\\n\\tday\\n}\\nendDate {\\n\\tyear\\n\\tmonth\\n\\tday\\n}\\nstatus\\nseason\\nformat\\ngenres\\nsynonyms\\nduration\\npopularity\\nepisodes\\nsource(version: 2)\\ncountryOfOrigin\\nhashtag\\naverageScore\\nsiteUrl\\ndescription\\nbannerImage\\nisAdult\\ncoverImage {\\n\\textraLarge\\n\\tcolor\\n}\\ntrailer {\\n\\tid\\n\\tsite\\n\\tthumbnail\\n}\\nexternalLinks {\\n\\tsite\\n\\turl\\n}\\nrankings {\\n\\trank\\n\\ttype\\n\\tseason\\n\\tallTime\\n}\\nstudios(isMain: true) {\\n\\tnodes {\\n\\t\\tid\\n\\t\\tname\\n\\t\\tsiteUrl\\n\\t}\\n}\\nrelations {\\n\\tedges {\\n\\t\\trelationType(version: 2)\\n\\t\\tnode {\\n\\t\\t\\tid\\n\\t\\t\\ttitle {\\n\\t\\t\\t\\tromaji\\n\\t\\t\\t\\tnative\\n\\t\\t\\t\\tenglish\\n\\t\\t\\t}\\n\\t\\t\\tsiteUrl\\n\\t\\t}\\n\\t}\\n}\\n\\nairingSchedule(\\n\\tnotYetAired: true\\n\\tperPage: 2\\n) {\\n\\tnodes {\\n\\t\\tepisode\\n\\t\\tairingAt\\n\\t}\\n}\\n\\n\\t\\t}\\n\\t}\\n}\",\"variables\":{\"season\":\"SUMMER\",\"year\":2022,\"excludeFormat\":\"TV\",\"page\":1}}",
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
});

const fetchMediaSeason = ({ season, year, excludeFormat, minEpisodes, page = 1 }: { season: MediaSeason, year: number, excludeFormat?: MediaFormat, minEpisodes?: number, page?: number }) =>
  fetch('https://graphql.anilist.co/', {
    "headers": {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: searchQuery,
      variables: {
        season,
        year,
        excludeFormat,
        minEpisodes,
        page
      }
    })
  })

// from https://anichart.net/js/app.b1e2a7ec.js
const getSeason = (offset = 0, date = new Date()): { season: MediaSeason, year: number } => {
  if (offset > 12 || offset < -12) throw new Error("Anilist getSeason does not support offset months greater than 12")
  let currentYear = date.getFullYear()
  let currentMonth = date.getMonth() + offset

  if (currentMonth >= 12) {
    currentMonth %= 12
    currentYear += 1
  } else if (currentMonth < 0) {
    currentMonth += 12
    currentYear -= 1
  }

  const seasons = [{
    season: "winter",
    range: [0, 2]
  }, {
    season: "spring",
    range: [3, 5]
  }, {
    season: "summer",
    range: [6, 8]
  }, {
    season: "fall",
    range: [9, 11]
  }] as const
  const currentSeason = seasons.find(t =>{
    let e = t.range;
    return currentMonth >= e[0] && currentMonth <= e[1]
  })!
  const seasonName = currentSeason.season;
  return {
    season: seasonName.toUpperCase() as MediaSeason,
    year: currentYear
  }
}

export const searchSeries: SearchSeries = ({ ...rest }) => {
  if ('latest' in rest && rest.latest) {
    const { season, year } = getSeason()
    const { season: previousSeason, year: previousYear } = getSeason()
    const result = fetchMediaSeason({ season, year })
    const leftOvers = fetchMediaSeason({ season: previousSeason, year: previousYear, minEpisodes: 16 })
    return from()
  }

  return from([])
}
