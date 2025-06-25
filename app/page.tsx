"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Play, Star, Calendar, Clock, Film, Tv } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import type { Movie, TvSeries } from "@/lib/types";
import { useApiWithContext } from "@/hooks/use-api-with-context";
import { useApiUrl } from "@/contexts/api-url-context";
import { runtimeFormat } from "@/lib/utils";

function HeroSection({ featuredMovie }: { featuredMovie: Movie | null }) {
  if (!featuredMovie) {
    return (
      <div className="h-[70vh] bg-gray-800 rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading featured content...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-xl">
      <Image
        src={api.utils.getTmdbImageUrl(
          featuredMovie?.backdropPath || "",
          "original"
        )}
        alt={featuredMovie?.title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Badge variant="secondary" className="bg-red-600 text-white">
              Featured
            </Badge>
            <span>{featuredMovie?.year}</span>
            {featuredMovie?.runtime && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {runtimeFormat(featuredMovie?.runtime)}
                </div>
              </>
            )}
            {featuredMovie?.rating && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {featuredMovie?.rating}
                </div>
              </>
            )}
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">
            {featuredMovie.title}
          </h1>

          <div className="flex gap-2 mb-4">
            {featuredMovie.genres.map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                className="border-gray-500 text-gray-300"
              >
                {genre}
              </Badge>
            ))}
          </div>

          <p className="text-gray-300 text-lg leading-relaxed mb-6 line-clamp-3">
            {featuredMovie.overview}
          </p>

          <div className="flex gap-4">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200">
              <Play className="w-5 h-5 mr-2" />
              Play Now
            </Button>
            <Link href={`/movies/${featuredMovie?.id}`}>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-500 text-white hover:bg-white/10"
              >
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchSection({ onSearch }: { onSearch: (query: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSearch} className="relative mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        placeholder="Search movies and TV series..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 h-12 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-red-500"
      />
    </form>
  );
}

function MediaCard({
  item,
  type,
}: {
  item: Movie | TvSeries;
  type: "movie" | "series";
}) {
  const isMovie = type === "movie";
  const movie = item as Movie;
  const series = item as TvSeries;

  return (
    <Link href={`/${type === "movie" ? "movies" : "series"}/${item.id}`}>
      <Card className="group bg-gray-900/50 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
          <Image
            src={api.utils.getTmdbImageUrl(item.posterPath || "")}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {isMovie ? (
                <Film className="w-3 h-3 mr-1" />
              ) : (
                <Tv className="w-3 h-3 mr-1" />
              )}
              {isMovie ? "Movie" : "Series"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-white mb-2 line-clamp-1">
            {item.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {isMovie
                ? movie.year
                : new Date(series.firstAirDate || "").getFullYear()}
            </span>
            {isMovie && movie.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {movie.rating}
              </div>
            )}
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {item.genres.slice(0, 2).map((genre: string) => (
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

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-4" />
          <div className="h-4 bg-gray-800 rounded mb-2" />
          <div className="h-3 bg-gray-800 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(Movie | TvSeries)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { apiBaseUrl } = useApiUrl();

  // Fetch featured movies
  const { data: moviesData, loading: moviesLoading } = useApiWithContext(
    (baseUrl) => () =>
      api.client.movies.getAll({
        baseUrl,
        limit: 6,
        sortBy: "rating",
        sortOrder: "desc",
      }),
    []
  );

  // Fetch featured series
  const { data: seriesData, loading: seriesLoading } = useApiWithContext(
    (baseUrl) => () =>
      api.client.series.getAll({
        baseUrl,
        limit: 6,
        sortBy: "firstAirDate",
        sortOrder: "desc",
      }),
    []
  );

  // Get system stats
  const { data: healthData } = useApiWithContext(
    (baseUrl) => () => api.client.system.healthCheck(baseUrl),
    []
  );

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const [movieResults, seriesResults] = await Promise.all([
        api.client.movies.getAll({ baseUrl: apiBaseUrl!, search: query }),
        api.client.series.getAll({ baseUrl: apiBaseUrl!, search: query }),
      ]);
      setSearchResults([...movieResults.data, ...seriesResults.data]);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const featuredMovie = moviesData?.data?.[0] || null;
  const featuredMovies = moviesData?.data || [];
  const featuredSeries = seriesData?.data || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 space-y-12">
        <HeroSection featuredMovie={featuredMovie} />
        <SearchSection onSearch={handleSearch} />
        {isSearching && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Searching...</h2>
            <LoadingGrid />
          </section>
        )}

        {searchResults.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Search Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {searchResults.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  type={"episodes" in item ? "series" : "movie"}
                />
              ))}
            </div>
          </section>
        )}

        {/* Featured Movies */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Movies</h2>
            <Link href="/movies">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-white/10"
              >
                View All
              </Button>
            </Link>
          </div>
          {moviesLoading ? (
            <LoadingGrid />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {featuredMovies.map((movie) => (
                <MediaCard key={movie.id} item={movie} type="movie" />
              ))}
            </div>
          )}
        </section>

        {/* Featured Series */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured TV Series</h2>
            <Link href="/series">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-white/10"
              >
                View All
              </Button>
            </Link>
          </div>
          {seriesLoading ? (
            <LoadingGrid />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {featuredSeries.map((series) => (
                <MediaCard key={series.id} item={series} type="series" />
              ))}
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/30">
            <CardContent className="p-6 text-center">
              <Film className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {moviesData?.meta?.total || 0}
              </div>
              <div className="text-sm text-gray-400">Movies</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Tv className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {seriesData?.meta?.total || 0}
              </div>
              <div className="text-sm text-gray-400">TV Series</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {healthData ? "Online" : "Offline"}
              </div>
              <div className="text-sm text-gray-400">System Status</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {featuredMovies.length > 0
                  ? (
                      featuredMovies.reduce(
                        (sum, m) => sum + (m.rating || 0),
                        0
                      ) / featuredMovies.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <div className="text-sm text-gray-400">Avg Rating</div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
