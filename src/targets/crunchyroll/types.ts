// GET SERIES

export interface GetSeriesData {
  title: string
  slug_title: string
  description: string
  is_simulcast: boolean
  subtitle_locales: string[]
  keywords: any[]
  season_tags: string[]
  is_subbed: boolean
  extended_description: string
  extended_maturity_rating: GetSeriesExtendedMaturityRating
  id: string
  content_provider: string
  maturity_ratings: string[]
  is_mature: boolean
  mature_blocked: boolean
  seo_description: string
  availability_notes: string
  audio_locales: string[]
  images: GetSeriesImages
  media_count: number
  series_launch_year: number
  episode_count: number
  slug: string
  season_count: number
  is_dubbed: boolean
  seo_title: string
  channel_id: string
}

export interface GetSeriesExtendedMaturityRating {}

export interface GetSeriesImages {
  poster_tall: GetSeriesPosterTall[][]
  poster_wide: GetSeriesPosterWide[][]
}

export interface GetSeriesPosterTall {
  height: number
  source: string
  type: string
  width: number
}

export interface GetSeriesPosterWide {
  height: number
  source: string
  type: string
  width: number
}
// END GET SERIES

// GET EPISODES

export interface GetEpisodesData {
  mature_blocked: boolean
  id: string
  available_offline: boolean
  episode: string
  season_title: string
  slug_title: string
  season_slug_title: string
  premium_date: any
  listing_id: string
  premium_available_date: string
  season_number: number
  description: string
  seo_title: string
  episode_number?: number
  identifier: string
  availability_starts: string
  maturity_ratings: string[]
  is_premium_only: boolean
  season_tags: string[]
  season_id: string
  seo_description: string
  production_episode_id: string
  upload_date: string
  is_mature: boolean
  streams_link: string
  free_available_date: string
  slug: string
  episode_air_date: string
  next_episode_id: string
  recent_audio_locale: string
  availability_notes: string
  series_id: string
  eligible_region: string
  subtitle_locales: string[]
  hd_flag: boolean
  series_slug_title: string
  is_subbed: boolean
  versions: GetEpisodesVersion[]
  sequence_number: number
  extended_maturity_rating: GetEpisodesExtendedMaturityRating
  audio_locale: string
  duration_ms: number
  is_dubbed: boolean
  is_clip: boolean
  closed_captions_available: boolean
  series_title: string
  title: string
  ad_breaks: GetEpisodesAdBreak[]
  media_type: string
  channel_id: string
  availability_ends: string
  next_episode_title: string
  images: GetEpisodesImages
  available_date: any
}

export interface GetEpisodesVersion {
  audio_locale: string
  guid: string
  is_premium_only: boolean
  media_guid: string
  original: boolean
  season_guid: string
  variant: string
}

export interface GetEpisodesExtendedMaturityRating {}

export interface GetEpisodesAdBreak {
  offset_ms: number
  type: string
}

export interface GetEpisodesImages {
  thumbnail: GetEpisodesThumbnail[][]
}

export interface GetEpisodesThumbnail {
  height: number
  source: string
  type: string
  width: number
}

export interface GetEpisodesMeta {
  versions_considered: boolean
}
// END GET EPISODES

// SEARCH
export interface SearchRoot {
  total: number
  data: SearchData[]
  meta: SearchMeta
}

export interface SearchData {
  type: string
  count: number
  items: SearchItem[]
}

export interface SearchItem {
  sequenceNumber?: number
  images: SearchImages
  id: string
  isPublic?: boolean
  description: string
  maturityRatings?: SearchMaturityRatings
  copyright?: string
  readyToPublish?: boolean
  title: string
  type: string
  isPremiumOnly?: boolean
  matureBlocked?: boolean
  animeIds?: any[]
  search_metadata: SearchMetadata
  hash?: string
  licensor?: string
  updatedAt?: string
  isMature?: boolean
  durationMs?: number
  originalRelease?: string
  slug: string
  genres?: SearchGenre[]
  publishDate?: string
  artist?: SearchArtist
  new: boolean
  streams_link?: string
  availability?: SearchAvailability
  createdAt?: string
  external_id?: string
  slug_title?: string
  linked_resource_key?: string
  channel_id?: string
  promo_description?: string
  series_metadata?: SearchSeriesMetadata
  promo_title?: string
  episode_metadata?: SearchEpisodeMetadata
}

export interface SearchImages {
  thumbnail?: any[]
  poster_tall?: SearchPosterTall[][]
  poster_wide?: SearchPosterWide[][]
}

export interface SearchPosterTall {
  height: number
  source: string
  type: string
  width: number
}

export interface SearchPosterWide {
  height: number
  source: string
  type: string
  width: number
}

export interface SearchMaturityRatings {}

export interface SearchMetadata {
  score: number
}

export interface SearchGenre {
  displayValue: string
  id: string
}

export interface SearchArtist {
  id: string
  name: string
  slug: string
}

export interface SearchAvailability {
  endDate: string
  startDate: string
}

export interface SearchSeriesMetadata {
  audio_locales: string[]
  availability_notes: string
  episode_count: number
  extended_description: string
  extended_maturity_rating: SearchExtendedMaturityRating
  is_dubbed: boolean
  is_mature: boolean
  is_simulcast: boolean
  is_subbed: boolean
  mature_blocked: boolean
  maturity_ratings: string[]
  season_count: number
  series_launch_year: number
  subtitle_locales: string[]
}

export interface SearchExtendedMaturityRating {}

export interface SearchEpisodeMetadata {
  ad_breaks: SearchAdBreak[]
  audio_locale: string
  availability_ends: string
  availability_notes: string
  availability_starts: string
  available_date: any
  available_offline: boolean
  closed_captions_available: boolean
  duration_ms: number
  eligible_region: string
  episode: string
  episode_air_date: string
  episode_number?: number
  extended_maturity_rating: SearchExtendedMaturityRating2
  free_available_date: string
  identifier: string
  is_clip: boolean
  is_dubbed: boolean
  is_mature: boolean
  is_premium_only: boolean
  is_subbed: boolean
  mature_blocked: boolean
  maturity_ratings: string[]
  premium_available_date: string
  premium_date: any
  season_id: string
  season_number: number
  season_slug_title: string
  season_title: string
  sequence_number: number
  series_id: string
  series_slug_title: string
  series_title: string
  subtitle_locales: string[]
  upload_date: string
  versions: SearchVersion[]
}

export interface SearchAdBreak {
  offset_ms: number
  type: string
}

export interface SearchExtendedMaturityRating2 {}

export interface SearchVersion {
  audio_locale: string
  guid: string
  is_premium_only: boolean
  media_guid: string
  original: boolean
  season_guid: string
  variant: string
}

export interface SearchMeta {}
// END SEARCH