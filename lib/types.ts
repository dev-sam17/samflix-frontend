export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export enum TranscodeStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  QUEUED = "QUEUED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
// Types based on your Prisma schema
export interface Movie {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  filePath: string;
  fileName: string;
  resolution?: string;
  quality?: string;
  rip?: string;
  sound?: string;
  provider?: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  genres: string[];
  runtime?: number;
  rating?: number;
  playPath: string;
  transcodeStatus: TranscodeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TvSeries {
  id: string;
  tmdbId: number;
  title: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  genres: string[];
  firstAirDate?: string;
  lastAirDate?: string;
  status?: string;
  episodes: Episode[];
  seasons: Season[];
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  tmdbId: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  overview?: string;
  filePath: string;
  fileName: string;
  resolution?: string;
  quality?: string;
  rip?: string;
  sound?: string;
  provider?: string;
  airDate?: string;
  seriesId: string;
  playPath: string;
  transcodeStatus: TranscodeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFolder {
  id: string;
  path: string;
  type: "movies" | "series";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScanningConflict {
  id: string;
  fileName: string;
  filePath: string;
  mediaType: "movie" | "series";
  possibleMatches: any[];
  resolved: boolean;
  selectedId?: number;
  createdAt: string;
  updatedAt: string;
}
