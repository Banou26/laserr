import pThrottle from 'p-throttle'

import { GraphQLTypes, populateHandle } from 'scannarr'

import { HandleRelation } from '../../generated/graphql'

export const icon = 'https://cdn.myanimelist.net/images/favicon.ico'
export const origin = 'mal'
export const categories = ['ANIME'] as const
export const name = 'MyAnimeList'
export const scheme = 'mal'

const throttle = pThrottle({
	limit: 4,
	interval: 1_000
})

type AlternativeTitlesObject = {
  /** The English title of the media */ 
  en: string
  /** The original (native) name of the media */
  ja: string
  /** A list of synonyms of the media */
  synonyms: string[]
}

type BroadcastObject = {
  // Define properties based on your requirements
}

type GenreObject = {
  // Define properties based on your requirements
}

type PictureObject = {
  large: string
  medium: string
}

type SeasonObject = {
  // Define properties based on your requirements
}

type AnimeStudioObject = {
  // Define properties based on your requirements
}

type MyListStatusObject = {
  // Define properties based on your requirements
}

type CalendarDate = string | Date; // Assuming CalendarDate to be either a string or Date object
type NSFWState = 'white' | 'gray' | 'black';
type MediaType = 'tv' | 'ova' | 'movie' | 'special' | 'ona' | 'music' | 'unknown';
type BroadcastStatus = 'finished_airing' | 'currently_airing' | 'not_yet_aired';
type SourceType = 'original' | 'manga' | '4_koma_manga' | 'web_manga' | 'digital_manga' | 'novel' | 'light_novel' | 'visual_novel' | 'game' | 'card_game' | 'book' | 'picture_book' | 'radio' | 'music' | 'other';
type Rating = 'g' | 'pg' | 'pg_13' | 'r' | 'r+' | 'rx';

export type AnimeObject = {
  node: Object;
  alternative_titles: AlternativeTitlesObject;
  average_episode_duration: number;
  broadcast: BroadcastObject;
  created_at: Date;
  end_date: CalendarDate;
  genres: GenreObject[];
  id: number;
  main_picture: PictureObject;
  mean: number;
  media_type: MediaType;
  nsfw: NSFWState;
  num_episodes: number;
  num_favorites: number;
  num_list_users: number;
  num_scoring_users: number;
  popularity: number;
  rank: number;
  start_date: CalendarDate;
  start_season: SeasonObject;
  status: BroadcastStatus;
  synopsis: string;
  source: SourceType;
  studio: AnimeStudioObject;
  title: string;
  updated_at: Date;
  my_list_status: MyListStatusObject;
  background: string;
  related_anime: AnimeObject[];
  rating: Rating;
}

export const normalizeToMedia = (data: AnimeObject): NoExtraProperties<Media> => {

  const anizipHandle = populateHandle({
    origin: 'anizip',
    id: data.id.toString(),
    url: `https://api.ani.zip/mappings?mal_id=${data.id}`,
    handles: []
  })

  return ({
    ...populateHandle({
      origin,
      id: data.id.toString(),
      url: `https://myanimelist.net/anime/${data.id}`,
      handles:
        anizipHandle
          ? [anizipHandle]
          : []
    }),

    id: data.id,
    title: {
      english: data.alternative_titles.en,
      romanized: data.title,
      native: data.alternative_titles.ja
    },
    coverImage: [{
      large: data.main_picture.large,
      medium: data.main_picture.medium
    }],
    averageScore: data.mean,
    description: data.synopsis,
    shortDescription: data.synopsis,
    popularity: data.popularity,
    status:
      data.status === 'not_yet_aired' ? GraphQLTypes.MediaStatus.NotYetReleased
      : data.status === 'currently_airing' ? GraphQLTypes.MediaStatus.Releasing
      : data.status === 'finished_airing' ? GraphQLTypes.MediaStatus.Finished
      : undefined,
    startDate: data.start_date && {
      year: new Date(data.start_date).getFullYear(),
      month: new Date(data.start_date).getMonth(),
      day: new Date(data.start_date).getDate()
    },
    endDate: data.end_date && {
      year: new Date(data.end_date).getFullYear(),
      month: new Date(data.end_date).getMonth(),
      day: new Date(data.end_date).getDate()
    }
  })
}
