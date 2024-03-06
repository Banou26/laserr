/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** ISO 3166-1 alpha-2 country code */
  CountryCode: any;
  /** ISO 8601:2004 date-time */
  Date: any;
  /** 8 digit long date integer (YYYYMMDD). Unknown dates represented by 0. E.g. 2016: 20160000, May 1976: 19760500 */
  FuzzyDateInt: any;
  /** ISO 21778:2017 JavaScript Object Notation (JSON) */
  Json: any;
  /** RFC 3986 uniform resource identifier (URI) as stricter form "scheme:path */
  Uri: any;
};

export type Authenticate = {
  __typename?: 'Authenticate';
  oauth2?: Maybe<AuthenticateOauth2>;
};

export type AuthenticateInput = {
  oauth2?: InputMaybe<AuthenticateInputOauth2>;
  origin: Scalars['String'];
  type: AuthenticationMethodType;
};

export type AuthenticateInputOauth2 = {
  authorizationCode: Scalars['String'];
  clientId: Scalars['String'];
  codeVerifier: Scalars['String'];
  grantType: Scalars['String'];
  redirectUri: Scalars['String'];
};

export type AuthenticateOauth2 = {
  __typename?: 'AuthenticateOauth2';
  accessToken: Scalars['String'];
  expiresIn: Scalars['Int'];
  refreshToken: Scalars['String'];
  tokenType: Scalars['String'];
};

export type Authentication = {
  __typename?: 'Authentication';
  authentication?: Maybe<Scalars['Boolean']>;
  methods?: Maybe<Array<AuthenticationMethod>>;
  origin: Origin;
};

export type AuthenticationMethod = {
  __typename?: 'AuthenticationMethod';
  body?: Maybe<Scalars['String']>;
  headers?: Maybe<Array<AuthenticationMethodHeaderValue>>;
  type: AuthenticationMethodType;
  url?: Maybe<Scalars['String']>;
};

export type AuthenticationMethodHeaderValue = {
  __typename?: 'AuthenticationMethodHeaderValue';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type AuthenticationMethodHeaderValueInput = {
  key: Scalars['String'];
  value: Scalars['String'];
};

export enum AuthenticationMethodType {
  Oauth2 = 'OAUTH2'
}

export type Episode = Handle & {
  __typename?: 'Episode';
  /** The time the episode airs at */
  airingAt?: Maybe<Scalars['Float']>;
  /** The description of the episode */
  description?: Maybe<Scalars['String']>;
  handles: EpisodeConnection;
  id: Scalars['String'];
  /** The associate media of the episode */
  media?: Maybe<Media>;
  /** The associate media uri of the episode */
  mediaUri?: Maybe<Scalars['String']>;
  /** The episode number */
  number?: Maybe<Scalars['Float']>;
  origin: Scalars['String'];
  /** The playback information for the episode */
  playback?: Maybe<PlaybackSourceConnection>;
  /** The url for the thumbnail image of the video */
  thumbnail?: Maybe<Scalars['String']>;
  /** Seconds until episode starts airing */
  timeUntilAiring?: Maybe<Scalars['Float']>;
  /** The title of the episode */
  title?: Maybe<MediaTitle>;
  uri: Scalars['Uri'];
  url?: Maybe<Scalars['String']>;
};

export type EpisodeConnection = HandleConnection & {
  __typename?: 'EpisodeConnection';
  edges: Array<EpisodeEdge>;
  nodes: Array<Episode>;
};

/** Episode connection edge */
export type EpisodeEdge = HandleEdge & {
  __typename?: 'EpisodeEdge';
  /** The relation between the two handles */
  handleRelationType: HandleRelation;
  node: Episode;
  /** The uri of the connection */
  uri?: Maybe<Scalars['Int']>;
};

export type EpisodeInput = {
  /** Filter by the media id */
  id?: InputMaybe<Scalars['String']>;
  /** Filter by the media origin */
  origin?: InputMaybe<Scalars['String']>;
  /** Filter by the media uri */
  uri?: InputMaybe<Scalars['Uri']>;
};

export type EpisodePage = {
  __typename?: 'EpisodePage';
  /** The current page */
  currentPageCursor?: Maybe<Scalars['String']>;
  /** The first page */
  firstPageCursor?: Maybe<Scalars['String']>;
  /** Total number of items on the current page */
  inPage?: Maybe<Scalars['Int']>;
  /** The last page cursor */
  lastPageCursor?: Maybe<Scalars['String']>;
  /** The current page */
  nextPageCursor?: Maybe<Scalars['String']>;
  /** The media page nodes */
  nodes: Array<Episode>;
  /** The current page */
  previousPageCursor?: Maybe<Scalars['String']>;
  /** The total number of items. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  total?: Maybe<Scalars['Int']>;
  /** Total number of items after the current page. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  totalAfter?: Maybe<Scalars['Int']>;
  /** Total number of items before the current page. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  totalBefore?: Maybe<Scalars['Int']>;
};

export type EpisodePageInput = {
  /** How many pages after the cursor to return */
  after?: InputMaybe<Scalars['Int']>;
  /** Cursor from where to start */
  at?: InputMaybe<Scalars['String']>;
  /** How many pages before the cursor to return */
  before?: InputMaybe<Scalars['Int']>;
  /** Filter by the media id */
  id?: InputMaybe<Scalars['String']>;
  /** Filter by the media origin */
  origin?: InputMaybe<Scalars['String']>;
  /** Filter by search terms */
  search?: InputMaybe<Scalars['String']>;
  /** The order the results will be returned in */
  sorts?: InputMaybe<Array<EpisodeSort>>;
  /** Filter by the media uri */
  uri?: InputMaybe<Scalars['Uri']>;
};

export enum EpisodeSort {
  EndDate = 'END_DATE',
  EndDateDesc = 'END_DATE_DESC',
  Format = 'FORMAT',
  FormatDesc = 'FORMAT_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Latest = 'LATEST',
  Oldest = 'OLDEST',
  Popularity = 'POPULARITY',
  PopularityDesc = 'POPULARITY_DESC',
  Score = 'SCORE',
  ScoreDesc = 'SCORE_DESC',
  SearchMatch = 'SEARCH_MATCH',
  StartDate = 'START_DATE',
  StartDateDesc = 'START_DATE_DESC',
  Status = 'STATUS',
  StatusDesc = 'STATUS_DESC',
  TitleEnglish = 'TITLE_ENGLISH',
  TitleEnglishDesc = 'TITLE_ENGLISH_DESC',
  TitleNative = 'TITLE_NATIVE',
  TitleNativeDesc = 'TITLE_NATIVE_DESC',
  TitleRomanized = 'TITLE_ROMANIZED',
  TitleRomanizedDesc = 'TITLE_ROMANIZED_DESC',
  Type = 'TYPE',
  TypeDesc = 'TYPE_DESC'
}

export enum ExternalLinkMediaType {
  Anime = 'ANIME',
  Manga = 'MANGA',
  Staff = 'STAFF'
}

export enum ExternalLinkType {
  Info = 'INFO',
  Social = 'SOCIAL',
  Streaming = 'STREAMING'
}

/** Date object that allows for incomplete date values (fuzzy) */
export type FuzzyDate = {
  __typename?: 'FuzzyDate';
  /** Numeric Day (24) */
  day?: Maybe<Scalars['Int']>;
  /** Numeric Month (3) */
  month?: Maybe<Scalars['Int']>;
  /** Numeric Year (2017) */
  year?: Maybe<Scalars['Int']>;
};

/** Date object that allows for incomplete date values (fuzzy) */
export type FuzzyDateInput = {
  /** Numeric Day (24) */
  day?: InputMaybe<Scalars['Int']>;
  /** Numeric Month (3) */
  month?: InputMaybe<Scalars['Int']>;
  /** Numeric Year (2017) */
  year?: InputMaybe<Scalars['Int']>;
};

/**  A Handle represents a unique identifier for a resource.  */
export type Handle = {
  handles: HandleConnection;
  /**  The id of the resource, e.g: 'react' for the React package  */
  id: Scalars['String'];
  /**  The origin of the resource, e.g: 'npm', generally the host of the resource  */
  origin: Scalars['String'];
  /**
   * The uri of the resource.
   * An uri is the combination of the handler, the origin and the id
   * e.g: 'fkn:npm:react' for the React package
   */
  uri: Scalars['Uri'];
  /**  The URL of the resource, e.g: 'https://npmjs.com/package/react'  */
  url?: Maybe<Scalars['String']>;
};

export type HandleConnection = {
  edges: Array<HandleEdge>;
  nodes: Array<Handle>;
};

export type HandleEdge = {
  /** The relation between the two handles */
  handleRelationType: HandleRelation;
  node: Handle;
};

export enum HandleRelation {
  Identical = 'IDENTICAL'
}

/**
 * Media is a type of handle that represents a media.
 * It generally represents a Movie, TV Show, Game, Package, ect...
 */
export type Media = Handle & {
  __typename?: 'Media';
  /** The average score of the media */
  averageScore?: Maybe<Scalars['Float']>;
  /** The banner image of the media */
  bannerImage?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The cover images of the media */
  coverImage?: Maybe<Array<Maybe<MediaCoverImage>>>;
  /** Long description of the media's story and characters */
  description?: Maybe<Scalars['String']>;
  /** The last official release date of the media */
  endDate?: Maybe<FuzzyDate>;
  episodeCount?: Maybe<Scalars['Int']>;
  episodes?: Maybe<EpisodeConnection>;
  /** External links to another site related to the media */
  externalLinks?: Maybe<Array<Maybe<MediaExternalLink>>>;
  format?: Maybe<MediaFormat>;
  handles: MediaConnection;
  id: Scalars['String'];
  /** If the media is intended only for 18+ adult audiences */
  isAdult?: Maybe<Scalars['Boolean']>;
  origin: Scalars['String'];
  /** The number of users with the media on their list */
  popularity?: Maybe<Scalars['Int']>;
  /** The season the media was initially released in */
  season?: Maybe<MediaSeason>;
  /** The season year the media was initially released in */
  seasonYear?: Maybe<Scalars['Int']>;
  /** Short description of the media's story and characters */
  shortDescription?: Maybe<Scalars['String']>;
  /** The first official release date of the media */
  startDate?: Maybe<FuzzyDate>;
  /** The current releasing status of the media */
  status?: Maybe<MediaStatus>;
  /** Alternative titles of the media */
  synonyms?: Maybe<Array<Maybe<MediaSynonym>>>;
  /** The official titles of the media in various languages */
  title?: Maybe<MediaTitle>;
  /** Media trailer or advertisement */
  trailers?: Maybe<Array<Maybe<MediaTrailer>>>;
  /** The type of the media */
  type?: Maybe<MediaType>;
  uri: Scalars['Uri'];
  url?: Maybe<Scalars['String']>;
};


/**
 * Media is a type of handle that represents a media.
 * It generally represents a Movie, TV Show, Game, Package, ect...
 */
export type MediaDescriptionArgs = {
  asHtml?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Media is a type of handle that represents a media.
 * It generally represents a Movie, TV Show, Game, Package, ect...
 */
export type MediaEpisodesArgs = {
  notYetAired?: InputMaybe<Scalars['Boolean']>;
  page?: InputMaybe<Scalars['Int']>;
  perPage?: InputMaybe<Scalars['Int']>;
};


/**
 * Media is a type of handle that represents a media.
 * It generally represents a Movie, TV Show, Game, Package, ect...
 */
export type MediaShortDescriptionArgs = {
  asHtml?: InputMaybe<Scalars['Boolean']>;
};

/** Media Airing Schedule. NOTE: We only aim to guarantee that FUTURE airing data is present and accurate. */
export type MediaAiringSchedule = Handle & {
  __typename?: 'MediaAiringSchedule';
  /** The time the episode airs at */
  airingAt?: Maybe<Scalars['Float']>;
  /** The description of the episode */
  description?: Maybe<Scalars['String']>;
  /** The airing episode number */
  episodeNumber: Scalars['Int'];
  handles: HandleConnection;
  id: Scalars['String'];
  /** The associate media of the airing episode */
  media?: Maybe<Media>;
  /** The associate media uri of the airing episode */
  mediaUri?: Maybe<Scalars['String']>;
  origin: Scalars['String'];
  /** The url for the thumbnail image of the video */
  thumbnail?: Maybe<Scalars['String']>;
  /** Seconds until episode starts airing */
  timeUntilAiring?: Maybe<Scalars['Float']>;
  /** The title of the episode */
  title?: Maybe<MediaTitle>;
  uri: Scalars['Uri'];
  url?: Maybe<Scalars['String']>;
};

export type MediaAiringScheduleConnection = {
  __typename?: 'MediaAiringScheduleConnection';
  edges?: Maybe<Array<Maybe<MediaAiringScheduleEdge>>>;
  nodes?: Maybe<Array<Maybe<MediaAiringSchedule>>>;
};

/** MediaAiringSchedule connection edge */
export type MediaAiringScheduleEdge = {
  __typename?: 'MediaAiringScheduleEdge';
  node?: Maybe<MediaAiringSchedule>;
  /** The uri of the connection */
  uri?: Maybe<Scalars['Int']>;
};

export type MediaConnection = HandleConnection & {
  __typename?: 'MediaConnection';
  edges: Array<MediaEdge>;
  nodes: Array<Media>;
};

/** The cover images of the media */
export type MediaCoverImage = {
  __typename?: 'MediaCoverImage';
  /** Average #hex color of cover image */
  color?: Maybe<Scalars['String']>;
  /** The cover image of the media by default. Using highest resolution available. */
  default?: Maybe<Scalars['String']>;
  /** The cover image of the media at its largest size. 500x735 */
  extraLarge?: Maybe<Scalars['String']>;
  /** The cover image of the media at large size. 250x367 */
  large?: Maybe<Scalars['String']>;
  /** The cover image of the media at medium size. 120x171 */
  medium?: Maybe<Scalars['String']>;
  /** The cover image of the media at small size. 64x92 */
  small?: Maybe<Scalars['String']>;
};

export type MediaEdge = HandleEdge & {
  __typename?: 'MediaEdge';
  /** The relation between the two handles */
  handleRelationType: HandleRelation;
  node: Media;
};

/** An external link to another site related to the media or its properties */
export type MediaExternalLink = Handle & {
  __typename?: 'MediaExternalLink';
  color?: Maybe<Scalars['String']>;
  handles: HandleConnection;
  /** The icon image url of the site. Not available for all links */
  icon?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  isDisabled?: Maybe<Scalars['Boolean']>;
  /** Language the site content is in */
  language?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  origin: Scalars['String'];
  type?: Maybe<ExternalLinkType>;
  uri: Scalars['Uri'];
  url?: Maybe<Scalars['String']>;
};

/** The format the media was released in */
export enum MediaFormat {
  /** Professionally published manga with more than one chapter */
  Manga = 'MANGA',
  /** Anime movies with a theatrical release */
  Movie = 'MOVIE',
  /** Short anime released as a music video */
  Music = 'MUSIC',
  /** Written books released as a series of light novels */
  Novel = 'NOVEL',
  /** (Original Net Animation) Anime that have been originally released online or are only available through streaming services. */
  Ona = 'ONA',
  /** Manga with just one chapter */
  OneShot = 'ONE_SHOT',
  /**
   * (Original Video Animation) Anime that have been released directly on
   * DVD/Blu-ray without originally going through a theatrical release or
   * television broadcast
   */
  Ova = 'OVA',
  /** Special episodes that have been included in DVD/Blu-ray releases, picture dramas, pilots, etc */
  Special = 'SPECIAL',
  /** Anime broadcast on television */
  Tv = 'TV',
  /** Anime which are under 15 minutes in length and broadcast on television */
  TvShort = 'TV_SHORT'
}

export type MediaInput = {
  /** Filter by the media id */
  id?: InputMaybe<Scalars['String']>;
  /** Filter by the media origin */
  origin?: InputMaybe<Scalars['String']>;
  /** Filter by the media uri */
  uri?: InputMaybe<Scalars['Uri']>;
};

export type MediaPage = {
  __typename?: 'MediaPage';
  /** The current page */
  currentPageCursor?: Maybe<Scalars['String']>;
  /** The first page */
  firstPageCursor?: Maybe<Scalars['String']>;
  /** Total number of items on the current page */
  inPage?: Maybe<Scalars['Int']>;
  /** The last page cursor */
  lastPageCursor?: Maybe<Scalars['String']>;
  /** The current page */
  nextPageCursor?: Maybe<Scalars['String']>;
  /** The media page nodes */
  nodes: Array<Media>;
  /** The current page */
  previousPageCursor?: Maybe<Scalars['String']>;
  /** The total number of items. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  total?: Maybe<Scalars['Int']>;
  /** Total number of items after the current page. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  totalAfter?: Maybe<Scalars['Int']>;
  /** Total number of items before the current page. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  totalBefore?: Maybe<Scalars['Int']>;
};

export type MediaPageInput = {
  /** How many pages after the cursor to return */
  after?: InputMaybe<Scalars['Int']>;
  /** Cursor from where to start */
  at?: InputMaybe<Scalars['String']>;
  /** How many pages before the cursor to return */
  before?: InputMaybe<Scalars['Int']>;
  /** Filter by the end date of the media */
  endDate?: InputMaybe<Scalars['FuzzyDateInt']>;
  /** Filter by the media id */
  id?: InputMaybe<Scalars['String']>;
  /** Filter by the media origin */
  origin?: InputMaybe<Scalars['String']>;
  /** Filter by search terms */
  search?: InputMaybe<Scalars['String']>;
  /** Filter by media season */
  season?: InputMaybe<MediaSeason>;
  /** Filter by the year of the media season */
  seasonYear?: InputMaybe<Scalars['Int']>;
  /** The order the results will be returned in */
  sorts?: InputMaybe<Array<MediaSort>>;
  /** Filter by the start date of the media */
  startDate?: InputMaybe<Scalars['FuzzyDateInt']>;
  /** Filter by the media's current release status */
  status?: InputMaybe<MediaStatus>;
  /** Filter by the media uri */
  uri?: InputMaybe<Scalars['Uri']>;
};

export enum MediaSeason {
  /** Months September to November */
  Fall = 'FALL',
  /** Months March to May */
  Spring = 'SPRING',
  /** Months June to August */
  Summer = 'SUMMER',
  /** Months December to February */
  Winter = 'WINTER'
}

export enum MediaSort {
  EndDate = 'END_DATE',
  EndDateDesc = 'END_DATE_DESC',
  Format = 'FORMAT',
  FormatDesc = 'FORMAT_DESC',
  Id = 'ID',
  IdDesc = 'ID_DESC',
  Popularity = 'POPULARITY',
  PopularityDesc = 'POPULARITY_DESC',
  Score = 'SCORE',
  ScoreDesc = 'SCORE_DESC',
  SearchMatch = 'SEARCH_MATCH',
  StartDate = 'START_DATE',
  StartDateDesc = 'START_DATE_DESC',
  Status = 'STATUS',
  StatusDesc = 'STATUS_DESC',
  TitleEnglish = 'TITLE_ENGLISH',
  TitleEnglishDesc = 'TITLE_ENGLISH_DESC',
  TitleNative = 'TITLE_NATIVE',
  TitleNativeDesc = 'TITLE_NATIVE_DESC',
  TitleRomanized = 'TITLE_ROMANIZED',
  TitleRomanizedDesc = 'TITLE_ROMANIZED_DESC',
  Type = 'TYPE',
  TypeDesc = 'TYPE_DESC'
}

/** Source type the media was adapted from */
export enum MediaSource {
  /** Japanese Anime */
  Anime = 'ANIME',
  /** Comics excluding manga */
  Comic = 'COMIC',
  /** Self-published works */
  Doujinshi = 'DOUJINSHI',
  /** Games excluding video games */
  Game = 'GAME',
  /** Written work published in volumes */
  LightNovel = 'LIGHT_NOVEL',
  /** Live action media such as movies or TV show */
  LiveAction = 'LIVE_ACTION',
  /** Asian comic book */
  Manga = 'MANGA',
  /** Multimedia project */
  MultimediaProject = 'MULTIMEDIA_PROJECT',
  /** Written works not published in volumes */
  Novel = 'NOVEL',
  /** An original production not based of another work */
  Original = 'ORIGINAL',
  /** Other */
  Other = 'OTHER',
  /** Picture book */
  PictureBook = 'PICTURE_BOOK',
  /** Video game */
  VideoGame = 'VIDEO_GAME',
  /** Video game driven primary by text and narrative */
  VisualNovel = 'VISUAL_NOVEL',
  /** Written works published online */
  WebNovel = 'WEB_NOVEL'
}

/** The current releasing status of the media */
export enum MediaStatus {
  /** Ended before the work could be finished */
  Cancelled = 'CANCELLED',
  /** Has completed and is no longer being released */
  Finished = 'FINISHED',
  /** Is currently paused from releasing and will resume at a later date */
  Hiatus = 'HIATUS',
  /** To be released at a later date */
  NotYetReleased = 'NOT_YET_RELEASED',
  /** Currently releasing */
  Releasing = 'RELEASING'
}

/** Alternative titles of the media */
export type MediaSynonym = {
  __typename?: 'MediaSynonym';
  /** Is alternative title a romanized version of the native title */
  isRomanized?: Maybe<Scalars['Boolean']>;
  /** The language the title is in */
  language?: Maybe<Scalars['String']>;
  /** The score of the title based on searchability */
  score?: Maybe<Scalars['Float']>;
  /** The alternative title */
  synonym?: Maybe<Scalars['String']>;
};

/** The official titles of the media in various languages */
export type MediaTitle = {
  __typename?: 'MediaTitle';
  /** The official english title */
  english?: Maybe<Scalars['String']>;
  /** The official language title */
  language?: Maybe<Scalars['String']>;
  /** Official title in it's native language */
  native?: Maybe<Scalars['String']>;
  /** Official title in it's romanized form */
  romanized?: Maybe<Scalars['String']>;
  /** The currently authenticated users preferred title language. Default english */
  userPreferred?: Maybe<Scalars['String']>;
};


/** The official titles of the media in various languages */
export type MediaTitleLanguageArgs = {
  countryCode?: InputMaybe<Scalars['CountryCode']>;
};

/** Media trailer or advertisement */
export type MediaTrailer = Handle & {
  __typename?: 'MediaTrailer';
  handles: HandleConnection;
  id: Scalars['String'];
  origin: Scalars['String'];
  /** The url for the thumbnail image of the video */
  thumbnail?: Maybe<Scalars['String']>;
  uri: Scalars['Uri'];
  url?: Maybe<Scalars['String']>;
};

/** The type of the media */
export enum MediaType {
  /** Japanese Anime */
  Anime = 'ANIME',
  /** Comics excluding manga */
  Comic = 'COMIC',
  /** Self-published works */
  Doujinshi = 'DOUJINSHI',
  /** Games excluding video games */
  Game = 'GAME',
  /** Written work published in volumes */
  LightNovel = 'LIGHT_NOVEL',
  /** Live action media such as movies or TV show */
  LiveAction = 'LIVE_ACTION',
  /** Asian comic book */
  Manga = 'MANGA',
  /** Movies with a theatrical release */
  Movie = 'MOVIE',
  /** Multimedia project */
  MultimediaProject = 'MULTIMEDIA_PROJECT',
  /** Short anime released as a music video */
  Music = 'MUSIC',
  /** Written works not published in volumes */
  Novel = 'NOVEL',
  /** (Original Net Animation) Anime that have been originally released online or are only available through streaming services. */
  Ona = 'ONA',
  /** Manga with just one chapter */
  OneShot = 'ONE_SHOT',
  /** Other */
  Other = 'OTHER',
  /**
   * (Original Video Animation) Anime that have been released directly on
   * DVD/Blu-ray without originally going through a theatrical release or
   * television broadcast
   */
  Ova = 'OVA',
  /** Picture book */
  PictureBook = 'PICTURE_BOOK',
  /** Software */
  Software = 'SOFTWARE',
  /** Special episodes that have been included in DVD/Blu-ray releases, pilots, etc */
  Special = 'SPECIAL',
  /** Media broadcast on television */
  Tv = 'TV',
  /** Media which are under 15 minutes in length and broadcast on television */
  TvShort = 'TV_SHORT',
  /** Video */
  Video = 'VIDEO',
  /** Video game */
  VideoGame = 'VIDEO_GAME',
  /** Video game driven primary by text and narrative */
  VisualNovel = 'VISUAL_NOVEL',
  /** Written works published online */
  WebNovel = 'WEB_NOVEL'
}

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']>;
  authenticate: Authenticate;
};


export type MutationAuthenticateArgs = {
  input: AuthenticateInput;
};

/**
 * Media is a type of handle that represents a media.
 * It generally represents a Movie, TV Show, Game, Package, ect...
 */
export type Origin = {
  __typename?: 'Origin';
  /** The media types of the target */
  categories: Array<MediaType>;
  /** The icon URL */
  icon?: Maybe<Scalars['String']>;
  /** Origin ID, e.g: "nflx" for Netflix */
  id: Scalars['String'];
  /** If the origin returns metadata only, e.g no playback or download data */
  metadataOnly?: Maybe<Scalars['Boolean']>;
  /** Origin full name, e.g: "Netflix"  */
  name: Scalars['String'];
  /** If the origin is official, e.g a legal redistributor or platform */
  official?: Maybe<Scalars['Boolean']>;
  /** Origin ID, e.g: "nflx" for Netflix */
  origin: Scalars['String'];
  supportedUris?: Maybe<Array<Scalars['String']>>;
  /** The origin's URL, e.g "https://www.netflix.com/""  */
  url?: Maybe<Scalars['String']>;
};

export type OriginInput = {
  /** Filter by origin categories */
  categories?: InputMaybe<Array<MediaType>>;
  /** Filter by the media id */
  id?: InputMaybe<Scalars['String']>;
  /** Filter by if the origin only returns metadata */
  metadataOnly?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the media origin */
  name?: InputMaybe<Scalars['String']>;
  /** Filter by if the origin is official */
  official?: InputMaybe<Scalars['Boolean']>;
};

export type OriginPageInput = {
  /** Filter by origin categories */
  categories?: InputMaybe<Array<MediaType>>;
  /** Filter by the media id */
  ids?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by if the origin only returns metadata */
  metadataOnly?: InputMaybe<Scalars['Boolean']>;
  /** Filter by the media origin */
  names?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by if the origin is official */
  official?: InputMaybe<Scalars['Boolean']>;
};

export type PlaybackSource = Handle & {
  __typename?: 'PlaybackSource';
  bytes?: Maybe<Scalars['Float']>;
  /** Stringified (json?) data for the playback, useful for custom players */
  data?: Maybe<Scalars['String']>;
  episode?: Maybe<Episode>;
  episodeRange?: Maybe<Scalars['String']>;
  filename?: Maybe<Scalars['String']>;
  filesCount?: Maybe<Scalars['Int']>;
  format?: Maybe<Scalars['String']>;
  handles: PlaybackSourceConnection;
  hash?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  media?: Maybe<Media>;
  origin: Scalars['String'];
  resolution?: Maybe<Scalars['String']>;
  structure?: Maybe<PlaybackSourceFileStructure>;
  team?: Maybe<Team>;
  thumbnails?: Maybe<Array<Maybe<Scalars['String']>>>;
  title?: Maybe<MediaTitle>;
  /** The type of playback */
  type?: Maybe<PlaybackSourceType>;
  uploadDate?: Maybe<Scalars['Float']>;
  uri: Scalars['Uri'];
  url?: Maybe<Scalars['String']>;
};

export type PlaybackSourceConnection = HandleConnection & {
  __typename?: 'PlaybackSourceConnection';
  edges: Array<PlaybackSourceEdge>;
  nodes: Array<PlaybackSource>;
};

/** PlaybackSource connection edge */
export type PlaybackSourceEdge = HandleEdge & {
  __typename?: 'PlaybackSourceEdge';
  /** The relation between the two handles */
  handleRelationType: HandleRelation;
  node: PlaybackSource;
  /** The uri of the connection */
  uri?: Maybe<Scalars['Int']>;
};

export enum PlaybackSourceFileStructure {
  Multi = 'MULTI',
  Single = 'SINGLE'
}

export type PlaybackSourceInput = {
  /** Filter by the media id */
  id?: InputMaybe<Scalars['String']>;
  /** Filter by the media origin */
  origin?: InputMaybe<Scalars['String']>;
  /** Filter by the media uri */
  uri?: InputMaybe<Scalars['Uri']>;
};

export type PlaybackSourcePage = {
  __typename?: 'PlaybackSourcePage';
  /** The current page */
  currentPageCursor?: Maybe<Scalars['String']>;
  /** The first page */
  firstPageCursor?: Maybe<Scalars['String']>;
  /** Total number of items on the current page */
  inPage?: Maybe<Scalars['Int']>;
  /** The last page cursor */
  lastPageCursor?: Maybe<Scalars['String']>;
  /** The current page */
  nextPageCursor?: Maybe<Scalars['String']>;
  /** The media page nodes */
  nodes: Array<PlaybackSource>;
  /** The current page */
  previousPageCursor?: Maybe<Scalars['String']>;
  /** The total number of items. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  total?: Maybe<Scalars['Int']>;
  /** Total number of items after the current page. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  totalAfter?: Maybe<Scalars['Int']>;
  /** Total number of items before the current page. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  totalBefore?: Maybe<Scalars['Int']>;
};

export type PlaybackSourcePageInput = {
  /** How many pages after the cursor to return */
  after?: InputMaybe<Scalars['Int']>;
  /** Cursor from where to start */
  at?: InputMaybe<Scalars['String']>;
  /** How many pages before the cursor to return */
  before?: InputMaybe<Scalars['Int']>;
  /** Filter by the media id */
  id?: InputMaybe<Scalars['String']>;
  number?: InputMaybe<Scalars['Int']>;
  /** Filter by the media origin */
  origin?: InputMaybe<Scalars['String']>;
  /** Filter by search terms */
  search?: InputMaybe<Scalars['String']>;
  /** Filter by the media uri */
  uri?: InputMaybe<Scalars['Uri']>;
};

export enum PlaybackSourceType {
  Custom = 'CUSTOM',
  Iframe = 'IFRAME',
  Other = 'OTHER',
  Torrent = 'TORRENT'
}

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']>;
  authentication: Array<Authentication>;
  episode?: Maybe<Episode>;
  episodePage?: Maybe<EpisodePage>;
  media?: Maybe<Media>;
  mediaPage?: Maybe<MediaPage>;
  origin?: Maybe<Origin>;
  originPage: Array<Origin>;
  playbackSource?: Maybe<PlaybackSource>;
  playbackSourcePage?: Maybe<PlaybackSourcePage>;
  user: User;
  userMediaPage: UserMediaPage;
};


export type QueryEpisodeArgs = {
  input?: InputMaybe<EpisodeInput>;
};


export type QueryEpisodePageArgs = {
  input?: InputMaybe<EpisodePageInput>;
};


export type QueryMediaArgs = {
  input?: InputMaybe<MediaInput>;
};


export type QueryMediaPageArgs = {
  input: MediaPageInput;
};


export type QueryOriginArgs = {
  input: OriginInput;
};


export type QueryOriginPageArgs = {
  input: OriginPageInput;
};


export type QueryPlaybackSourceArgs = {
  input?: InputMaybe<PlaybackSourceInput>;
};


export type QueryPlaybackSourcePageArgs = {
  input?: InputMaybe<PlaybackSourcePageInput>;
};


export type QueryUserArgs = {
  input: UserInput;
};


export type QueryUserMediaPageArgs = {
  input: UserMediaPageInput;
};

export type Resource = Handle & {
  __typename?: 'Resource';
  batchResources: Array<ResourceConnection>;
  handles: ResourceConnection;
  id: Scalars['String'];
  isBatch?: Maybe<Scalars['Boolean']>;
  origin: Scalars['String'];
  uri: Scalars['Uri'];
  url?: Maybe<Scalars['String']>;
};

export type ResourceConnection = HandleConnection & {
  __typename?: 'ResourceConnection';
  edges: Array<ResourceEdge>;
  nodes: Array<Resource>;
};

export type ResourceEdge = HandleEdge & {
  __typename?: 'ResourceEdge';
  /** The relation between the two handles */
  handleRelationType: HandleRelation;
  node: Resource;
};

export type Subscription = {
  __typename?: 'Subscription';
  _empty?: Maybe<Scalars['String']>;
  episode?: Maybe<Episode>;
  episodePage?: Maybe<EpisodePage>;
  media?: Maybe<Media>;
  mediaPage?: Maybe<MediaPage>;
  playbackSource?: Maybe<PlaybackSource>;
  playbackSourcePage?: Maybe<PlaybackSourcePage>;
};


export type SubscriptionEpisodeArgs = {
  input?: InputMaybe<EpisodeInput>;
};


export type SubscriptionEpisodePageArgs = {
  input?: InputMaybe<EpisodePageInput>;
};


export type SubscriptionMediaArgs = {
  input: MediaInput;
};


export type SubscriptionMediaPageArgs = {
  input: MediaPageInput;
};


export type SubscriptionPlaybackSourceArgs = {
  input?: InputMaybe<PlaybackSourceInput>;
};


export type SubscriptionPlaybackSourcePageArgs = {
  input?: InputMaybe<PlaybackSourcePageInput>;
};

export type Team = Handle & {
  __typename?: 'Team';
  handles: HandleConnection;
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  origin: Scalars['String'];
  uri: Scalars['Uri'];
  url?: Maybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  username: Scalars['String'];
};

export type UserInput = {
  oauth2?: InputMaybe<UserInputOauth2>;
  origin: Scalars['String'];
  type: AuthenticationMethodType;
};

export type UserInputOauth2 = {
  accessToken: Scalars['String'];
  tokenType: Scalars['String'];
};

export type UserMedia = {
  __typename?: 'UserMedia';
  episodes: Array<UserMediaEpisode>;
  media: Media;
  status: UserMediaStatus;
};

export type UserMediaEpisode = {
  __typename?: 'UserMediaEpisode';
  episode: Episode;
  origin: Origin;
  progress?: Maybe<Scalars['Int']>;
  uri: Scalars['Uri'];
  watched: Scalars['Boolean'];
};

export type UserMediaPage = {
  __typename?: 'UserMediaPage';
  /** The current page */
  currentPageCursor?: Maybe<Scalars['String']>;
  /** The first page */
  firstPageCursor?: Maybe<Scalars['String']>;
  /** Total number of items on the current page */
  inPage?: Maybe<Scalars['Int']>;
  /** The last page cursor */
  lastPageCursor?: Maybe<Scalars['String']>;
  /** The current page */
  nextPageCursor?: Maybe<Scalars['String']>;
  /** The media page nodes */
  nodes: Array<Media>;
  /** The current page */
  previousPageCursor?: Maybe<Scalars['String']>;
  /** The total number of items. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  total?: Maybe<Scalars['Int']>;
  /** Total number of items after the current page. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  totalAfter?: Maybe<Scalars['Int']>;
  /** Total number of items before the current page. Note: This value is not guaranteed to be accurate, do not rely on this for logic */
  totalBefore?: Maybe<Scalars['Int']>;
};

export type UserMediaPageInput = {
  authentications: Array<UserMediaPageInputAuthentication>;
  status?: InputMaybe<Array<UserMediaStatus>>;
};

export type UserMediaPageInputAuthentication = {
  oauth2?: InputMaybe<UserInputOauth2>;
  origin: Scalars['String'];
  type: AuthenticationMethodType;
};

/** The current releasing status of the media */
export enum UserMediaStatus {
  /** Has completed */
  Completed = 'COMPLETED',
  /** Dropped */
  Dropped = 'DROPPED',
  /** Put on hold */
  OnHold = 'ON_HOLD',
  /** Planning to watch */
  PlanToWatch = 'PLAN_TO_WATCH',
  /** Currently watching */
  Watching = 'WATCHING'
}

export type SearchCrunchyrollHandleQueryVariables = Exact<{
  input: MediaPageInput;
}>;


export type SearchCrunchyrollHandleQuery = { __typename?: 'Query', mediaPage?: { __typename?: 'MediaPage', nodes: Array<{ __typename?: 'Media', origin: string, id: string, url?: string | null, uri: any, title?: { __typename?: 'MediaTitle', english?: string | null, romanized?: string | null, native?: string | null } | null, handles: { __typename?: 'MediaConnection', edges: Array<{ __typename?: 'MediaEdge', node: { __typename?: 'Media', origin: string, id: string, url?: string | null, uri: any, title?: { __typename?: 'MediaTitle', english?: string | null, romanized?: string | null, native?: string | null } | null, handles: { __typename?: 'MediaConnection', edges: Array<{ __typename?: 'MediaEdge', node: { __typename?: 'Media', origin: string, id: string, url?: string | null, uri: any } }> } } }> } }> } | null };


export const SearchCrunchyrollHandleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchCrunchyrollHandle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MediaPageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mediaPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"english"}},{"kind":"Field","name":{"kind":"Name","value":"romanized"}},{"kind":"Field","name":{"kind":"Name","value":"native"}}]}},{"kind":"Field","name":{"kind":"Name","value":"handles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"english"}},{"kind":"Field","name":{"kind":"Name","value":"romanized"}},{"kind":"Field","name":{"kind":"Name","value":"native"}}]}},{"kind":"Field","name":{"kind":"Name","value":"handles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}}]}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SearchCrunchyrollHandleQuery, SearchCrunchyrollHandleQueryVariables>;