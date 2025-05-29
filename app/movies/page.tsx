"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Grid, List, Star, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { api, type Movie } from "@/lib/api"
import { usePaginatedApi, useApi } from "@/hooks/use-api"

function MovieCard({ movie, viewMode }: { movie: Movie; viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:bg-gray-800/50">
        <CardContent className="p-0">
          <div className="flex gap-4">
            <div className="relative w-24 h-36 flex-shrink-0">
              <Image
                src={api.utils.getTmdbImageUrl(movie.posterPath || "", "w300")}
                alt={movie.title}
                fill
                className="object-cover rounded-l-lg"
              />
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{movie.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <span>{movie.year}</span>
                    {movie.runtime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {movie.runtime}m
                      </div>
                    )}
                    {movie.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {movie.rating}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {movie.quality && (
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      {movie.quality}
                    </Badge>
                  )}
                  {movie.resolution && (
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      {movie.resolution}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {movie.genres.map((genre: string) => (
                  <Badge key={genre} variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {genre}
                  </Badge>
                ))}
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{movie.overview}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Link href={`/movies/${movie.id}`}>
      <Card className="group bg-gray-900/50 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
          <Image
            src={api.utils.getTmdbImageUrl(movie.posterPath || "")}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute top-2 right-2 flex gap-2">
            {movie.quality && (
              <Badge variant="secondary" className="bg-green-600 text-white">
                {movie.quality}
              </Badge>
            )}
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            {movie.rating && (
              <div className="flex items-center gap-1 text-white text-sm">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {movie.rating}
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-white mb-2 line-clamp-1">{movie.title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>{movie.year}</span>
            {movie.runtime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {movie.runtime}m
              </div>
            )}
          </div>
          <div className="flex gap-1 flex-wrap">
            {movie.genres.slice(0, 2).map((genre: string) => (
              <Badge key={genre} variant="outline" className="text-xs border-gray-600 text-gray-300">
                {genre}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function LoadingGrid({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-800 h-36 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-4" />
          <div className="h-4 bg-gray-800 rounded mb-2" />
          <div className="h-3 bg-gray-800 rounded w-2/3" />
        </div>
      ))}
    </div>
  )
}

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [sortBy, setSortBy] = useState("title")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Fetch genres
  const { data: genres } = useApi(() => api.movies.getGenres(), [])

  // Fetch movies with pagination and filters
  const {
    data: movies,
    loading,
    pagination,
    updateParams,
  } = usePaginatedApi((params) => api.movies.getAll(params), {
    page: 1,
    limit: 24,
    sortBy: "title",
    sortOrder: "asc" as const,
  })

  // Update filters
  useEffect(() => {
    const params: any = {
      page: 1,
      sortBy,
      sortOrder: sortBy === "year" || sortBy === "rating" ? "desc" : "asc",
    }

    if (searchQuery) {
      params.search = searchQuery
    }

    if (selectedGenre !== "all") {
      params.genre = selectedGenre
    }

    updateParams(params)
  }, [searchQuery, selectedGenre, sortBy, updateParams])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== "") {
        updateParams({ search: searchQuery, page: 1 })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, updateParams])

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      updateParams({ page: pagination.page + 1 })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-red-500">
              Samflix
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/movies" className="text-red-400">
                Movies
              </Link>
              <Link href="/series" className="hover:text-red-400 transition-colors">
                TV Series
              </Link>
              <Link href="/genres" className="hover:text-red-400 transition-colors">
                Genres
              </Link>
              <Link href="/scanner" className="hover:text-red-400 transition-colors">
                Scanner
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Movies</h1>
          <p className="text-gray-400">Discover and manage your movie collection</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-red-500"
              />
            </div>

            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Genres</SelectItem>
                {genres?.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="createdAt">Recently Added</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-red-600 hover:bg-red-700" : "border-gray-600 hover:bg-white/10"}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-red-600 hover:bg-red-700" : "border-gray-600 hover:bg-white/10"}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            {pagination ? (
              <>
                Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} movies
              </>
            ) : (
              "Loading movies..."
            )}
          </p>
        </div>

        {/* Movies Grid/List */}
        {loading ? (
          <LoadingGrid viewMode={viewMode} />
        ) : movies.length > 0 ? (
          <>
            <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" : "space-y-4"}>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} viewMode={viewMode} />
              ))}
            </div>

            {/* Load More Button */}
            {pagination && pagination.page < pagination.totalPages && (
              <div className="mt-8 text-center">
                <Button onClick={handleLoadMore} className="bg-red-600 hover:bg-red-700" disabled={loading}>
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No movies found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
