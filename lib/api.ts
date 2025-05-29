// API configuration and types
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://samflix-be.devsam.in"

// Types based on your Prisma schema
export interface Movie {
  id: string
  tmdbId: number
  title: string
  year: number
  filePath: string
  fileName: string
  resolution?: string
  quality?: string
  rip?: string
  sound?: string
  provider?: string
  overview?: string
  posterPath?: string
  backdropPath?: string
  genres: string[]
  runtime?: number
  rating?: number
  createdAt: string
  updatedAt: string
}

export interface TvSeries {
  id: string
  tmdbId: number
  title: string
  overview?: string
  posterPath?: string
  backdropPath?: string
  genres: string[]
  firstAirDate?: string
  lastAirDate?: string
  status?: string
  episodes: Episode[]
  createdAt: string
  updatedAt: string
}

export interface Episode {
  id: string
  tmdbId: number
  seasonNumber: number
  episodeNumber: number
  title: string
  overview?: string
  filePath: string
  fileName: string
  resolution?: string
  quality?: string
  rip?: string
  sound?: string
  provider?: string
  airDate?: string
  seriesId: string
  createdAt: string
  updatedAt: string
}

export interface MediaFolder {
  id: string
  path: string
  type: "movies" | "series"
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ScanningConflict {
  id: string
  fileName: string
  filePath: string
  mediaType: "movie" | "series"
  possibleMatches: any[]
  resolved: boolean
  selectedId?: number
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(errorData.message || `HTTP error! status: ${response.status}`, response.status, errorData)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError("Network error occurred", 0, error)
  }
}

// Movies API
export const moviesApi = {
  // Get all movies with optional pagination and filters
  getAll: async (params?: {
    page?: number
    limit?: number
    genre?: string
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<PaginatedResponse<Movie>> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.genre) searchParams.append("genre", params.genre)
    if (params?.search) searchParams.append("search", params.search)
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy)
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder)

    const query = searchParams.toString()
    return apiRequest<PaginatedResponse<Movie>>(`/api/movies${query ? `?${query}` : ""}`)
  },

  // Get movie by ID
  getById: async (id: string): Promise<Movie> => {
    return apiRequest<Movie>(`/api/movies/${id}`)
  },

  // Search movies
  search: async (query: string): Promise<Movie[]> => {
    return apiRequest<Movie[]>(`/api/movies/search?query=${encodeURIComponent(query)}`)
  },

  // Get movies by genre
  getByGenre: async (genre: string): Promise<Movie[]> => {
    return apiRequest<Movie[]>(`/api/movies/genre/${encodeURIComponent(genre)}`)
  },

  // Get all movie genres
  getGenres: async (): Promise<string[]> => {
    return apiRequest<string[]>("/api/movies/genres")
  },
}

// TV Series API
export const seriesApi = {
  // Get all series with optional pagination and filters
  getAll: async (params?: {
    page?: number
    limit?: number
    genre?: string
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<PaginatedResponse<TvSeries>> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.genre) searchParams.append("genre", params.genre)
    if (params?.search) searchParams.append("search", params.search)
    if (params?.status) searchParams.append("status", params.status)
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy)
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder)

    const query = searchParams.toString()
    return apiRequest<PaginatedResponse<TvSeries>>(`/api/series${query ? `?${query}` : ""}`)
  },

  // Get series by ID
  getById: async (id: string): Promise<TvSeries> => {
    return apiRequest<TvSeries>(`/api/series/${id}`)
  },

  // Search series
  search: async (query: string): Promise<TvSeries[]> => {
    return apiRequest<TvSeries[]>(`/api/series/search?query=${encodeURIComponent(query)}`)
  },

  // Get episodes by season
  getEpisodesBySeason: async (seriesId: string, seasonNumber: number): Promise<Episode[]> => {
    return apiRequest<Episode[]>(`/api/series/${seriesId}/season/${seasonNumber}`)
  },

  // Get series by genre
  getByGenre: async (genre: string): Promise<TvSeries[]> => {
    return apiRequest<TvSeries[]>(`/api/series/genre/${encodeURIComponent(genre)}`)
  },

  // Get specific episode
  getEpisode: async (seriesId: string, seasonNumber: number, episodeNumber: number): Promise<Episode> => {
    return apiRequest<Episode>(`/api/series/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`)
  },

  // Get all series genres
  getGenres: async (): Promise<string[]> => {
    return apiRequest<string[]>("/api/series/genres")
  },
}

// Scanner API
export const scannerApi = {
  // Start manual scan
  startScan: async (): Promise<{ message: string; scanId?: string }> => {
    return apiRequest<{ message: string; scanId?: string }>("/api/scanner/scan", {
      method: "POST",
    })
  },

  // Add media folder
  addFolder: async (folderData: { path: string; type: "movies" | "series" }): Promise<MediaFolder> => {
    return apiRequest<MediaFolder>("/api/scanner/folders", {
      method: "POST",
      body: JSON.stringify(folderData),
    })
  },

  // Get all media folders
  getFolders: async (): Promise<MediaFolder[]> => {
    return apiRequest<MediaFolder[]>("/api/scanner/folders")
  },

  // Update media folder
  updateFolder: async (id: string, updates: Partial<MediaFolder>): Promise<MediaFolder> => {
    return apiRequest<MediaFolder>(`/api/scanner/folders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  },

  // Delete media folder
  deleteFolder: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/scanner/folders/${id}`, {
      method: "DELETE",
    })
  },

  // Get scanning conflicts
  getConflicts: async (): Promise<ScanningConflict[]> => {
    return apiRequest<ScanningConflict[]>("/api/scanner/conflicts")
  },

  // Resolve scanning conflict
  resolveConflict: async (id: string, selectedId: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/scanner/conflicts/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ selectedId }),
    })
  },
}

// System API
export const systemApi = {
  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    return apiRequest<{ status: string; timestamp: string }>("/health")
  },
}

// Utility functions
export const utils = {
  // Get TMDB image URL
  getTmdbImageUrl: (path: string, size: "w300" | "w500" | "w780" | "original" = "w500"): string => {
    if (!path) return "/placeholder.svg?height=750&width=500"
    return `https://image.tmdb.org/t/p/${size}${path}`
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  },

  // Format duration
  formatDuration: (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  },

  // Debounce function for search
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(null, args), wait)
    }) as T
  },
}

// Export all APIs
export const api = {
  movies: moviesApi,
  series: seriesApi,
  scanner: scannerApi,
  system: systemApi,
  utils,
}

export default api
