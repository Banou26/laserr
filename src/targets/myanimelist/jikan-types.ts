export interface RecentEpisodes {
  pagination: Pagination
  data: RecentEpisodesData[]
}

export interface Pagination {
  last_visible_page: number
  has_next_page: boolean
}

export interface RecentEpisodesData {
  entry: Entry
  episodes: Episode[]
  region_locked: boolean
}

export interface Entry {
  mal_id: number
  url: string
  images: Images
  title: string
}

export interface Images {
  jpg: Jpg
  webp: Webp
}

export interface Jpg {
  image_url: string
  small_image_url: string
  large_image_url: string
}

export interface Webp {
  image_url: string
  small_image_url: string
  large_image_url: string
}

export interface Episode {
  mal_id: number
  url: string
  title: string
  premium: boolean
}
