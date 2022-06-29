import type { Category, SearchSeries, SeriesHandle } from '../../../../scannarr/src'
import type { MediaSeason, MediaFormat, Media, MediaExternalLink } from './types'

import { from, combineLatest, startWith, map, tap } from 'rxjs'
import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'

import { EqByUri } from '../../../../scannarr/src'
import { populateUri } from '../../../../scannarr/src/utils/uri'
import { LanguageTag } from '../../utils'
import { AiringSchedule } from './types'

export const icon = 'https://anilist.co/img/icons/favicon-32x32.png'
export const origin = 'https://anilist.co'
export const categories: Category[] = ['ANIME']
export const name = 'Anilist'
export const scheme = 'anilist'

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
        perPage: 25
      ) {
        nodes {
          episode
          airingAt
        }
      }

		}
	}
}`
// notYetAired: true
// perPage: 2

const seasonVariables = {season: "SUMMER", year: 2022, format: "TV", page: 1}
const seasonVariables2 = {season: "SUMMER", year: 2022, excludeFormat: "TV", page: 1}
const seasonVariables3 = {season: "SPRING", year: 2022, minEpisodes: 16, page: 1}

// fetch("https://graphql.anilist.co/", {
//   "headers": {
//     "content-type": "application/json"
//   },
//   "referrer": "https://anichart.net/",
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": "{\"query\":\"query (\\n\\t$season: MediaSeason,\\n\\t$year: Int,\\n\\t$format: MediaFormat,\\n\\t$excludeFormat: MediaFormat,\\n\\t$status: MediaStatus,\\n\\t$minEpisodes: Int,\\n\\t$page: Int,\\n){\\n\\tPage(page: $page) {\\n\\t\\tpageInfo {\\n\\t\\t\\thasNextPage\\n\\t\\t\\ttotal\\n\\t\\t}\\n\\t\\tmedia(\\n\\t\\t\\tseason: $season\\n\\t\\t\\tseasonYear: $year\\n\\t\\t\\tformat: $format,\\n\\t\\t\\tformat_not: $excludeFormat,\\n\\t\\t\\tstatus: $status,\\n\\t\\t\\tepisodes_greater: $minEpisodes,\\n\\t\\t\\tisAdult: false,\\n\\t\\t\\ttype: ANIME,\\n\\t\\t\\tsort: TITLE_ROMAJI,\\n\\t\\t) {\\n\\t\\t\\t\\nid\\nidMal\\ntitle {\\n\\tromaji\\n\\tnative\\n\\tenglish\\n}\\nstartDate {\\n\\tyear\\n\\tmonth\\n\\tday\\n}\\nendDate {\\n\\tyear\\n\\tmonth\\n\\tday\\n}\\nstatus\\nseason\\nformat\\ngenres\\nsynonyms\\nduration\\npopularity\\nepisodes\\nsource(version: 2)\\ncountryOfOrigin\\nhashtag\\naverageScore\\nsiteUrl\\ndescription\\nbannerImage\\nisAdult\\ncoverImage {\\n\\textraLarge\\n\\tcolor\\n}\\ntrailer {\\n\\tid\\n\\tsite\\n\\tthumbnail\\n}\\nexternalLinks {\\n\\tsite\\n\\turl\\n}\\nrankings {\\n\\trank\\n\\ttype\\n\\tseason\\n\\tallTime\\n}\\nstudios(isMain: true) {\\n\\tnodes {\\n\\t\\tid\\n\\t\\tname\\n\\t\\tsiteUrl\\n\\t}\\n}\\nrelations {\\n\\tedges {\\n\\t\\trelationType(version: 2)\\n\\t\\tnode {\\n\\t\\t\\tid\\n\\t\\t\\ttitle {\\n\\t\\t\\t\\tromaji\\n\\t\\t\\t\\tnative\\n\\t\\t\\t\\tenglish\\n\\t\\t\\t}\\n\\t\\t\\tsiteUrl\\n\\t\\t}\\n\\t}\\n}\\n\\nairingSchedule(\\n\\tnotYetAired: true\\n\\tperPage: 2\\n) {\\n\\tnodes {\\n\\t\\tepisode\\n\\t\\tairingAt\\n\\t}\\n}\\n\\n\\t\\t}\\n\\t}\\n}\",\"variables\":{\"season\":\"SUMMER\",\"year\":2022,\"excludeFormat\":\"TV\",\"page\":1}}",
//   "method": "POST",
//   "mode": "cors",
//   "credentials": "omit"
// });

const fetchMediaSeason = ({ season, year, excludeFormat, minEpisodes, page = 1 }: { season: MediaSeason, year: number, excludeFormat?: MediaFormat, minEpisodes?: number, page?: number }) =>
  fetch('https://graphql.anilist.co/', {
    method: 'POST',
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
const getCurrentSeason = (offset = 0, date = new Date()): { season: MediaSeason, year: number } => {
  if (offset > 12 || offset < -12) throw new Error("Anilist getCurrentSeason does not support offset months greater than 12")
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

const fetchSeason = () => {

}

const mediaToSeriesHandle = (media: Media) => populateUri({
  averageScore:
    media.averageScore
      ? media.averageScore / 100
      : undefined,
  airingSchedule:
    media.airingSchedule?.nodes
      ? media.airingSchedule.nodes?.map((airingSchedule: AiringSchedule) => ({
        date: new Date(airingSchedule.airingAt * 1000),
        number: airingSchedule.episode
      }))
      : undefined,
  scheme,
  categories,
  id: media.id.toString(),
  url: media.siteUrl ?? undefined,
  genres:
    media.genres?.length
      ? (
        media.genres.map((genre: string) => populateUri({
          scheme,
          id: genre,
          url: `https://anilist.co/search/anime?genres=${genre}`,
          name: genre
        }))
      )
      : undefined,
  names:
    Object
    .entries(media.title ?? {})
    .filter(([, name]) => name)
    .map(([language, name]) => ({
      name: name!,
      language:
        language === 'english' ? LanguageTag.EN
        : language === 'romaji' ? LanguageTag.JA
        // language === 'native'
        : LanguageTag.JA,
      score:
        language === 'romaji' ? 1
        : language === 'english' ? 0.8
        // language === 'native'
        : 0.6
    })),
  externalLinks:
    media.externalLinks
      ? (
        media.externalLinks.map((externalLink: MediaExternalLink) => ({
          url: externalLink.url,
          site: externalLink.site,
          type: externalLink.type,
          language: externalLink.language
        }))
      )
      : undefined,
  dates:
    media.startDate?.year
      ? [{
        language: 'jp',
        start: new Date(media.startDate?.year, media.endDate?.month!, media.endDate?.day ?? undefined),
        end:
          media.endDate?.year
            ? new Date(media.endDate?.year, media.endDate?.month!, media.endDate?.day ?? undefined)
            : undefined
      }]
      : undefined,
  handles: media.idMal ? [populateUri({
    id: media.idMal.toString(),
    scheme: 'mal'
  })] : undefined,
  images: [
    ...media.coverImage ? [{
      type: 'poster' as const,
      size:
        media.coverImage.extraLarge ? 'large' as const
        : media.coverImage.large ? 'medium' as const
        // media.coverImage.medium
        : 'small' as const,
      url:
        (media.coverImage.extraLarge
        ?? media.coverImage.large
        ?? media.coverImage.medium)!
    }] : [],
    ...media.bannerImage ? [{
      type: 'image' as const,
      size: 'large' as const,
      url: media.bannerImage!
    }] : [],
  ],
  popularity: media.popularity ?? undefined,
  status: media.status ?? undefined,
  synopses:
    media.description
      ? [{
        language: 'en',
        synopsis: media.description
      }]
      : undefined,
  withDetails: false
}) as SeriesHandle

// todo: add support for multiple graphql response pages
const getSeason = ({ season, year, excludeFormat, minEpisodes, page = 1 }: { season: MediaSeason, year: number, excludeFormat?: MediaFormat, minEpisodes?: number, page?: number }): Promise<SeriesHandle[]> =>
  fetchMediaSeason({ season, year, excludeFormat, minEpisodes, page })
    .then(response => response.json())
    .then(json => {
      const medias: Media[] = json.data.Page.media
      return medias.map(mediaToSeriesHandle)
    })

export const searchSeries: SearchSeries = ({ ...rest }) => {
  if ('latest' in rest && rest.latest) {
    const { season, year } = getCurrentSeason(1)
    const { season: previousSeason, year: previousSeasonYear } = getCurrentSeason()
    const result = getSeason({ season, year })
    const leftOvers = getSeason({ season: previousSeason, year: previousSeasonYear })
    return combineLatest([
      from(result),
      from(leftOvers)
        .pipe(
          map(handles =>
            handles
              .filter(handle => handle.status === 'RELEASING')
          )
        )
    ]).pipe(
      startWith([]),
      map(seriesHandles =>
          pipe(
            seriesHandles.flat(),
            A.uniq(EqByUri),
          ) as SeriesHandle[]
      ),
      tap(val => console.log('val', val))
    )
  }

  return from([])
}
