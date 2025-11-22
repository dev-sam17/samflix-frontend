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

// Enums matching Prisma schema
export enum Role {
  ADMIN = "ADMIN",
  TESTER = "TESTER",
  USER = "USER",
}

export enum TranscodeStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  QUEUED = "QUEUED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// Types based on Prisma schema
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
  rating?: number; // Maps to Prisma's rating field
  releaseDate: string; // Maps to Prisma's releaseDate DateTime
  transcodeStatus: TranscodeStatus;
  playPath: string;
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
  transcodeStatus: TranscodeStatus;
  createdAt: string;
  updatedAt: string;
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
  transcodeStatus: TranscodeStatus;
  playPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFolder {
  id: string;
  path: string;
  type: string; // "movies" or "series" - matches Prisma String type
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScanningConflict {
  id: string;
  fileName: string;
  filePath: string;
  mediaType: string; // "movie" or "series" - matches Prisma String type
  possibleMatches: any; // Maps to Prisma's Json type
  resolved: boolean;
  selectedId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  imageUrl?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  userStats?: UserStats;
}

export interface UserStats {
  id: string;
  userId: string;
  totalPlayTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}
