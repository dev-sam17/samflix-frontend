import type {
  Movie,
  TvSeries,
  Episode,
  MediaFolder,
  ScanningConflict,
  PaginatedResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

// API Error class
export class ApiError extends Error {
  constructor(message: string, public status: number, public response?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic API request function with cache support
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  cache: RequestCache = "force-cache",
  baseUrl: string
): Promise<T> {
  const url = new URL(endpoint, baseUrl);

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache,
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error occurred", 0, error);
  }
}

// Server-side data fetching functions
export const serverApi = {
  movies: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      genre?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<PaginatedResponse<Movie>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.genre) searchParams.append("genre", params.genre);
      if (params?.search) searchParams.append("search", params.search);
      if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

      const query = searchParams.toString();
      return apiRequest<PaginatedResponse<Movie>>(
        `/api/movies${query ? `?${query}` : ""}`,
        {},
        "force-cache",
        API_BASE_URL
      );
    },

    getById: (id: string): Promise<Movie> => {
      return apiRequest<Movie>(
        `/api/movies/${id}`,
        {},
        "force-cache",
        API_BASE_URL
      );
    },

    // Get all movie genres
    getAllGenres: (): Promise<string[]> => {
      return apiRequest<string[]>(
        `/api/movies/genres/all`,
        {},
        "force-cache",
        API_BASE_URL
      );
    },

    // Get movies by genre
    getByGenre: (genre: string): Promise<Movie[]> => {
      return apiRequest<Movie[]>(
        `/api/movies/genre/${encodeURIComponent(genre)}`,
        {},
        "force-cache",
        API_BASE_URL
      );
    },
  },

  series: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      genre?: string;
      search?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<PaginatedResponse<TvSeries>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.genre) searchParams.append("genre", params.genre);
      if (params?.search) searchParams.append("search", params.search);
      if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

      const query = searchParams.toString();
      return apiRequest<PaginatedResponse<TvSeries>>(
        `/api/series${query ? `?${query}` : ""}`,
        {},
        "force-cache",
        API_BASE_URL
      );
    },

    getById: (id: string): Promise<TvSeries> => {
      return apiRequest<TvSeries>(
        `/api/series/${id}`,
        {},
        "force-cache",
        API_BASE_URL
      );
    },

    // Get all series genres
    getAllGenres: (): Promise<string[]> => {
      return apiRequest<string[]>(
        `/api/series/genres/all`,
        {},
        "force-cache",
        API_BASE_URL
      );
    },

    // Get series by genre
    getByGenre: (genre: string): Promise<TvSeries[]> => {
      return apiRequest<TvSeries[]>(
        `/api/series/genre/${encodeURIComponent(genre)}`,
        {},
        "force-cache",
        API_BASE_URL
      );
    },
  },
};

// Client-side API functions (no caching, real-time data)
export const clientApi = {
  movies: {
    // Get all movies with optional pagination and filters
    getAll: async (params: {
      baseUrl: string;
      page?: number;
      limit?: number;
      genre?: string;
      status?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<PaginatedResponse<Movie>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.genre) searchParams.append("genre", params.genre);
      if (params?.status) searchParams.append("status", params.status);
      if (params?.search) searchParams.append("search", params.search);
      if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

      const query = searchParams.toString();
      return apiRequest<PaginatedResponse<Movie>>(
        `/api/movies${query ? `?${query}` : ""}`,
        {},
        "no-store",
        params.baseUrl
      );
    },

    // Get movie by ID
    getById: async (id: string, baseUrl: string): Promise<Movie> => {
      return apiRequest<Movie>(`/api/movies/${id}`, {}, "no-store", baseUrl);
    },

    // Search movies
    search: async (query: string, baseUrl: string): Promise<Movie[]> => {
      return apiRequest<Movie[]>(
        `/api/movies/search?query=${encodeURIComponent(query)}`,
        {},
        "no-store",
        baseUrl
      );
    },

    // Get movies by genre
    getByGenre: async (genre: string, baseUrl: string): Promise<Movie[]> => {
      return apiRequest<Movie[]>(
        `/api/movies/genre/${encodeURIComponent(genre)}`,
        {},
        "no-store",
        baseUrl
      );
    },

    // Get all movie genres
    getGenres: async (baseUrl: string): Promise<string[]> => {
      return apiRequest<string[]>(
        "/api/movies/genres",
        {},
        "no-store",
        baseUrl
      );
    },
  },

  series: {
    // Get all series with optional pagination and filters
    getAll: async (params: {
      baseUrl: string;
      page?: number;
      limit?: number;
      genre?: string;
      search?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<PaginatedResponse<TvSeries>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.genre) searchParams.append("genre", params.genre);
      if (params?.search) searchParams.append("search", params.search);
      if (params?.status) searchParams.append("status", params.status);
      if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

      const query = searchParams.toString();
      return apiRequest<PaginatedResponse<TvSeries>>(
        `/api/series${query ? `?${query}` : ""}`,
        {},
        "no-store",
        params.baseUrl
      );
    },

    // Get series by ID
    getById: async (id: string, baseUrl: string): Promise<TvSeries> => {
      return apiRequest<TvSeries>(`/api/series/${id}`, {}, "no-store", baseUrl);
    },

    // Search series
    search: async (query: string, baseUrl: string): Promise<TvSeries[]> => {
      return apiRequest<TvSeries[]>(
        `/api/series/search?query=${encodeURIComponent(query)}`,
        {},
        "no-store",
        baseUrl
      );
    },

    // Get episodes by season
    getEpisodesBySeason: async (
      seriesId: string,
      seasonNumber: number,
      baseUrl: string
    ): Promise<Episode[]> => {
      return apiRequest<Episode[]>(
        `/api/series/${seriesId}/season/${seasonNumber}`,
        {},
        "no-store",
        baseUrl
      );
    },

    // Get series by genre
    getByGenre: async (genre: string, baseUrl: string): Promise<TvSeries[]> => {
      return apiRequest<TvSeries[]>(
        `/api/series/genre/${encodeURIComponent(genre)}`,
        {},
        "no-store",
        baseUrl
      );
    },

    // Get specific episode
    getEpisode: async (
      seriesId: string,
      seasonNumber: number,
      episodeNumber: number,
      baseUrl: string
    ): Promise<Episode> => {
      return apiRequest<Episode>(
        `/api/series/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`,
        {},
        "no-store",
        baseUrl
      );
    },

    // Get all series genres
    getGenres: async (baseUrl: string): Promise<string[]> => {
      return apiRequest<string[]>(
        "/api/series/genres",
        {},
        "no-store",
        baseUrl
      );
    },
  },

  scanner: {
    // Start manual scan
    startScan: async (
      baseUrl: string
    ): Promise<{ message: string; scanId?: string }> => {
      return apiRequest<{ message: string; scanId?: string }>(
        "/api/scanner/scan",
        {
          method: "POST",
        },
        "no-store",
        baseUrl
      );
    },

    // Add media folder
    addFolder: async (
      baseUrl: string,
      folderData: {
        path: string;
        type: "movies" | "series";
      }
    ): Promise<MediaFolder> => {
      return apiRequest<MediaFolder>(
        "/api/scanner/folders",
        {
          method: "POST",
          body: JSON.stringify(folderData),
        },
        "no-store",
        baseUrl
      );
    },

    // Get all media folders
    getFolders: async (baseUrl: string): Promise<MediaFolder[]> => {
      return apiRequest<MediaFolder[]>(
        "/api/scanner/folders",
        {},
        "no-store",
        baseUrl
      );
    },

    // Update media folder
    updateFolder: async (
      baseUrl: string,
      id: string,
      updates: Partial<MediaFolder>
    ): Promise<MediaFolder> => {
      return apiRequest<MediaFolder>(
        `/api/scanner/folders/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        },
        "no-store",
        baseUrl
      );
    },

    // Delete media folder
    deleteFolder: async (
      baseUrl: string,
      id: string
    ): Promise<{ message: string }> => {
      return apiRequest<{ message: string }>(
        `/api/scanner/folders/${id}`,
        {
          method: "DELETE",
        },
        "no-store",
        baseUrl
      );
    },

    // Get scanning conflicts
    getConflicts: async (baseUrl: string): Promise<ScanningConflict[]> => {
      return apiRequest<ScanningConflict[]>(
        "/api/scanner/conflicts",
        {},
        "no-store",
        baseUrl
      );
    },

    // Resolve scanning conflict
    resolveConflict: async (
      baseUrl: string,
      id: string,
      selectedId: number
    ): Promise<{ message: string }> => {
      return apiRequest<{ message: string }>(
        `/api/scanner/conflicts/${id}/resolve`,
        {
          method: "POST",
          body: JSON.stringify({ selectedId }),
        },
        "no-store",
        baseUrl
      );
    },

    // Delete scanning conflict
    deleteConflict: async (
      baseUrl: string,
      id: string
    ): Promise<{ message: string }> => {
      return apiRequest<{ message: string }>(
        `/api/scanner/conflicts/${id}`,
        {
          method: "DELETE",
        },
        "no-store",
        baseUrl
      );
    },

    deleteAllConflicts: async (
      baseUrl: string
    ): Promise<{ message: string }> => {
      return apiRequest<{ message: string }>(
        `/api/scanner/conflicts`,
        {
          method: "DELETE",
        },
        "no-store",
        baseUrl
      );
    },
  },

  system: {
    // Health check
    healthCheck: async (
      baseUrl: string
    ): Promise<{ status: string; timestamp: string }> => {
      return apiRequest<{ status: string; timestamp: string }>(
        "/health",
        {},
        "no-store",
        baseUrl
      );
    },
  },

  transcode: {
    // Update Movie Transcode Status
    updateMovieStatus: async (
      baseUrl: string,
      id: string,
      status: string
    ): Promise<{
      success: boolean;
      message: string;
      data: {
        id: string;
        title: string;
        transcodeStatus: string;
      };
    }> => {
      return apiRequest<{
        success: boolean;
        message: string;
        data: {
          id: string;
          title: string;
          transcodeStatus: string;
        };
      }>(
        `/api/transcode/movie/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        },
        "no-store",
        baseUrl
      );
    },

    // Update Episode Transcode Status
    updateEpisodeStatus: async (
      baseUrl: string,
      id: string,
      status: string
    ): Promise<{
      success: boolean;
      message: string;
      data: {
        id: string;
        title: string;
        transcodeStatus: string;
      };
    }> => {
      return apiRequest<{
        success: boolean;
        message: string;
        data: {
          id: string;
          title: string;
          transcodeStatus: string;
        };
      }>(
        `/api/transcode/episode/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
          headers: {
            "Content-Type": "application/json",
          },
        },
        "no-store",
        baseUrl
      );
    },

    // Update Series Transcode Status (all episodes in series)
    updateSeriesStatus: async (
      baseUrl: string,
      id: string,
      status: string
    ): Promise<{
      success: boolean;
      message: string;
      data: {
        seriesId: string;
        updatedEpisodesCount: number;
        episodes: Array<{
          id: string;
          title: string;
          transcodeStatus: string;
          series: {
            id: string;
            title: string;
          };
        }>;
      };
    }> => {
      return apiRequest<{
        success: boolean;
        message: string;
        data: {
          seriesId: string;
          updatedEpisodesCount: number;
          episodes: Array<{
            id: string;
            title: string;
            transcodeStatus: string;
            series: {
              id: string;
              title: string;
            };
          }>;
        };
      }>(
        `/api/transcode/series/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
          headers: {
            "Content-Type": "application/json",
          },
        },
        "no-store",
        baseUrl
      );
    },

    // Get All Items by Transcode Status
    getAllByStatus: async (
      baseUrl: string,
      status: string
    ): Promise<{
      success: boolean;
      data: {
        movies: Array<{
          id: string;
          title: string;
          transcodeStatus: string;
        }>;
        episodes: Array<{
          id: string;
          title: string;
          transcodeStatus: string;
        }>;
      };
    }> => {
      return apiRequest<{
        success: boolean;
        data: {
          movies: Array<{
            id: string;
            title: string;
            transcodeStatus: string;
          }>;
          episodes: Array<{
            id: string;
            title: string;
            transcodeStatus: string;
          }>;
        };
      }>(`/api/transcode/status/${status}`, {}, "no-store", baseUrl);
    },

    // Get Movies by Transcode Status
    getMoviesByStatus: async (
      baseUrl: string,
      status: string
    ): Promise<{
      success: boolean;
      data: Array<{
        id: string;
        title: string;
        transcodeStatus: string;
      }>;
    }> => {
      return apiRequest<{
        success: boolean;
        data: Array<{
          id: string;
          title: string;
          transcodeStatus: string;
        }>;
      }>(`/api/transcode/movies/status/${status}`, {}, "no-store", baseUrl);
    },

    // Get Episodes by Transcode Status
    getEpisodesByStatus: async (
      baseUrl: string,
      status: string
    ): Promise<{
      success: boolean;
      data: Array<{
        id: string;
        title: string;
        transcodeStatus: string;
      }>;
    }> => {
      return apiRequest<{
        success: boolean;
        data: Array<{
          id: string;
          title: string;
          transcodeStatus: string;
        }>;
      }>(`/api/transcode/episodes/status/${status}`, {}, "no-store", baseUrl);
    },
  },

  progress: {
    // Save video progress
    saveProgress: async (
      baseUrl: string,
      clerkId: string,
      tmdbId: string,
      currentTime: number
    ): Promise<boolean> => {
      return apiRequest<boolean>(
        `/api/progress`,
        {
          method: "POST",
          body: JSON.stringify({ clerkId, tmdbId, currentTime }),
        },
        "no-store",
        baseUrl
      );
    },

    // Get progress for specific video
    getProgress: async (
      baseUrl: string,
      clerkId: string,
      tmdbId: string
    ): Promise<{ currentTime: number; updatedAt: string } | null> => {
      try {
        return await apiRequest<{ currentTime: number; updatedAt: string }>(
          `/api/progress/${clerkId}/${tmdbId}`,
          {},
          "no-store",
          baseUrl
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },

    // Get all progress for a user
    getAllProgress: async (
      baseUrl: string,
      clerkId: string
    ): Promise<Array<{ tmdbId: string; currentTime: number; updatedAt: string }>> => {
      return apiRequest<Array<{ tmdbId: string; currentTime: number; updatedAt: string }>>(
        `/api/progress/${clerkId}`,
        {},
        "no-store",
        baseUrl
      );
    },

    // Delete progress
    deleteProgress: async (
      baseUrl: string,
      clerkId: string,
      tmdbId: string
    ): Promise<boolean> => {
      const url = new URL(`/api/progress/${clerkId}/${tmdbId}`, baseUrl);
      
      const config: RequestInit = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      };

      try {
        const response = await fetch(url, config);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.message || `HTTP error! status: ${response.status}`,
            response.status,
            errorData
          );
        }

        // For 204 No Content, just return true (successful deletion)
        return true;
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError("Network error occurred", 0, error);
      }
    },
  },

  storage: {
    // Get storage statistics
    getStats: async (): Promise<{
      totalSpaceOccupied: string;
      spaceOccupiedByRawMedia: string;
      spaceOccupiedByHlsMedia: string;
      totalDiskSpace: string;
      lastScanTime: string | null;
      cached: boolean;
    }> => {
      return apiRequest(
        "/api/storage/stats",
        {},
        "no-store",
        API_BASE_URL
      );
    },

    // Get scan status
    getScanStatus: async (): Promise<{
      lastScanTime: string | null;
      isScanning: boolean;
    }> => {
      return apiRequest(
        "/api/storage/scan-status",
        {},
        "no-store",
        API_BASE_URL
      );
    },

    // Force disk scan
    forceScan: async (): Promise<{
      message: string;
      status: string;
    }> => {
      return apiRequest(
        "/api/storage/force-scan",
        {
          method: "POST",
        },
        "no-store",
        API_BASE_URL
      );
    },

    // Update total disk space
    updateDiskSpace: async (totalDiskSpace: string): Promise<{
      message: string;
      totalDiskSpace: string;
    }> => {
      return apiRequest(
        "/api/storage/update-disk-space",
        {
          method: "POST",
          body: JSON.stringify({ totalDiskSpace }),
        },
        "no-store",
        API_BASE_URL
      );
    },
  },

  utils: {
    // Get TMDB image URL
    getTmdbImageUrl: (
      path: string,
      size: "w300" | "w500" | "w780" | "original" = "w500"
    ): string => {
      if (!path) return "/placeholder.svg?height=750&width=500";
      return `https://image.tmdb.org/t/p/${size}${path}`;
    },

    // Format file size
    formatFileSize: (bytes: number): string => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (
        Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
      );
    },

    // Format duration
    formatDuration: (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}m`;
    },

    // Debounce function for search
    debounce: <T extends (...args: any[]) => any>(func: T, wait: number): T => {
      let timeout: NodeJS.Timeout;
      return ((...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
      }) as T;
    },
  },
};

// Export all APIs
export const api = {
  server: serverApi,
  client: clientApi,
  storage: clientApi.storage,
  utils: clientApi.utils,
};

export default api;
