"use client";

import type React from "react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Grid, List, Star, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { TranscodeStatus, type Movie } from "@/lib/types";
import { useApi } from "@/hooks/use-api";
import { useApiWithContext } from "@/hooks/use-api-with-context";
import { useApiUrl } from "@/contexts/api-url-context";
import { runtimeFormat } from "@/lib/utils";

type MovieParams = {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  search?: string;
  genre?: string;
};

// This can be a server component since it's just presentational
function MovieCard({
  movie,
  viewMode,
}: {
  movie: Movie;
  viewMode: "grid" | "list";
}) {
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
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <span>{movie.year}</span>
                    {movie.runtime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {runtimeFormat(movie.runtime)}
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
                    <Badge
                      variant="secondary"
                      className="bg-green-600 text-white"
                    >
                      {movie.quality}
                    </Badge>
                  )}
                  {movie.resolution && (
                    <Badge
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                    >
                      {movie.resolution}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {Array.isArray(movie.genres) && movie.genres.map((genre: string) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="text-xs border-gray-600 text-gray-300"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">
                {movie.overview}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
          <h3 className="font-semibold text-white mb-2 line-clamp-1">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>{movie.year}</span>
            {movie.runtime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {runtimeFormat(movie.runtime)}
              </div>
            )}
          </div>
          <div className="flex gap-1 flex-wrap">
            {Array.isArray(movie.genres) && movie.genres.slice(0, 2).map((genre: string) => (
              <Badge
                key={genre}
                variant="outline"
                className="text-xs border-gray-600 text-gray-300"
              >
                {genre}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// This can be a server component since it's just presentational
function LoadingGrid({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-800 h-36 rounded-lg" />
        ))}
      </div>
    );
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
  );
}

export default function MoviesPage() {
  const [params, setParams] = useState<MovieParams>({
    page: 1,
    limit: 24,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  // Use the new client API for real-time data
  const {
    data: moviesData,
    loading: moviesLoading,
    error,
  } = useApiWithContext(
    (baseUrl) => () =>
      api.client.movies.getAll({
        baseUrl,
        ...params,
        search: searchQuery,
        genre: selectedGenre !== "all" ? selectedGenre : undefined,
        status: "COMPLETED",
      }),
    [params, searchQuery, selectedGenre]
  );

  const { data: genres } = useApi(
    () => api.server.movies.getAllGenres(),
    []
  );

  const handleLoadMore = useCallback(() => {
    setParams((prev) => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const handleSearch = useCallback((value: string) => {
    setParams((prev) => ({ ...prev, page: 1 }));
    setSearchQuery(value);
  }, []);

  const handleGenreChange = useCallback((value: string) => {
    setParams((prev) => ({ ...prev, page: 1 }));
    setSelectedGenre(value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setParams((prev) => ({ ...prev, page: 1, sortBy: value }));
  }, []);

  const movies =
    moviesData?.data.filter(
      (movie) => movie.transcodeStatus === TranscodeStatus.COMPLETED
    ) || [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-red-500"
              />
            </div>

            <Select value={selectedGenre} onValueChange={handleGenreChange}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Genres</SelectItem>
                {Array.isArray(genres) && genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={params.sortBy} onValueChange={handleSortChange}>
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
                className={
                  viewMode === "grid"
                    ? "bg-red-600 hover:bg-red-700"
                    : "border-gray-600 hover:bg-white/10"
                }
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list"
                    ? "bg-red-600 hover:bg-red-700"
                    : "border-gray-600 hover:bg-white/10"
                }
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            {moviesData?.meta ? (
              <>
                Showing {(moviesData.meta.page - 1) * moviesData.meta.limit + 1}{" "}
                -{" "}
                {Math.min(
                  moviesData.meta.page * moviesData.meta.limit,
                  moviesData.meta.total
                )}{" "}
                of {moviesData.meta.total} movies
              </>
            ) : (
              "Loading movies..."
            )}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Failed to load movies
              </h3>
              <p className="text-gray-400 mb-4">
                {error.message || "An unexpected error occurred"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Movies Grid/List */}
        {!error && moviesLoading ? (
          <LoadingGrid viewMode={viewMode} />
        ) : !error && moviesData?.data.length ? (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
                  : "space-y-4"
              }
            >
              {moviesData.data.map((movie) => (
                <MovieCard key={movie.id} movie={movie} viewMode={viewMode} />
              ))}
            </div>

            {/* Load More Button */}
            {moviesData.meta &&
              moviesData.meta.page < moviesData.meta.totalPages && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleLoadMore}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={moviesLoading}
                  >
                    {moviesLoading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
          </>
        ) : !error ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No movies found matching your criteria.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
