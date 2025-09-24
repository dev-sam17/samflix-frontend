"use client";

import { useState } from "react";
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
import { Search, Filter, Grid, List, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { api } from "@/lib/api";
import type { TvSeries } from "@/lib/types";
import { TranscodeStatus } from "@/lib/types";
import { useApi } from "@/hooks/use-api";
import { useApiWithContext } from "@/hooks/use-api-with-context";

type SeriesParams = {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  search?: string;
  genre?: string;
  status?: string;
};

function SeriesCard({
  series,
  viewMode,
}: {
  series: TvSeries;
  viewMode: "grid" | "list";
}) {
  const totalEpisodes = series.episodes.length;
  const totalSeasons = Array.from(
    new Set(series.episodes.map((ep) => ep.seasonNumber))
  ).length;

  if (viewMode === "list") {
    return (
      <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:bg-gray-800/50">
        <CardContent className="p-0">
          <div className="flex gap-4">
            <div className="relative w-24 h-36 flex-shrink-0">
              <Image
                src={api.utils.getTmdbImageUrl(series.posterPath || "", "w300")}
                alt={series.title}
                fill
                className="object-cover rounded-l-lg"
              />
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {series.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <span>
                      {series.firstAirDate
                        ? new Date(series.firstAirDate).getFullYear()
                        : "Unknown"}
                    </span>
                    <span>
                      {totalSeasons} Season{totalSeasons > 1 ? "s" : ""}
                    </span>
                    <span>{totalEpisodes} Episodes</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      series.status === "Ended"
                        ? "bg-red-600 text-white"
                        : "bg-green-600 text-white"
                    }
                  >
                    {series.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {series.genres.map((genre: string) => (
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
                {series.overview}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={`/series/${series.id}`}>
      <Card className="group bg-gray-900/50 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
          <Image
            src={api.utils.getTmdbImageUrl(series.posterPath || "")}
            alt={series.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className={
                series.status === "Ended"
                  ? "bg-red-600 text-white"
                  : "bg-green-600 text-white"
              }
            >
              {series.status}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            <div className="text-white text-sm">
              <div>
                {totalSeasons} Season{totalSeasons > 1 ? "s" : ""}
              </div>
              <div className="text-xs text-gray-300">
                {totalEpisodes} Episodes
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-white mb-2 line-clamp-1">
            {series.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>
              {series.firstAirDate
                ? new Date(series.firstAirDate).getFullYear()
                : "Unknown"}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {series.status}
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {series.genres.slice(0, 2).map((genre: string) => (
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

// Loading skeleton component
function LoadingGrid({ viewMode }: { viewMode: "grid" | "list" }) {
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
          : "space-y-4"
      }
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="bg-gray-900/50 border-gray-800 animate-pulse">
          <div className="relative aspect-[2/3] bg-gray-800 rounded-t-lg" />
          <CardContent className="p-4">
            <div className="h-4 bg-gray-800 rounded mb-2" />
            <div className="h-3 bg-gray-800 rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SeriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [params, setParams] = useState<SeriesParams>({
    page: 1,
    limit: 24,
    sortBy: "title",
    sortOrder: "asc",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch series data
  const { data: seriesData, loading: seriesLoading } = useApiWithContext(
    (baseUrl) => () => api.client.series.getAll({ baseUrl, ...params }),
    [params]
  );

  // Fetch genres
  const { data: genres } = useApi(
    () => api.server.series.getAllGenres(),
    []
  );

  // Handle search with debounce
  const handleSearch = api.utils.debounce((value: string) => {
    setParams((prev) => ({ ...prev, page: 1, search: value || undefined }));
  }, 300);

  // Handle genre change
  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    setParams((prev) => ({
      ...prev,
      page: 1,
      genre: value === "all" ? undefined : value,
    }));
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setParams((prev) => ({
      ...prev,
      page: 1,
      status: value === "all" ? undefined : value,
    }));
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setParams((prev) => ({ ...prev, page: 1, sortBy: value }));
  };

  // Handle load more
  const handleLoadMore = () => {
    if (seriesData?.meta && params.page < seriesData.meta.totalPages) {
      setParams((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  // Filter series to only show completed ones
  const filteredSeries = seriesData?.data?.filter(
    (series) => series.transcodeStatus === TranscodeStatus.COMPLETED
  ) || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">TV Series</h1>
          <p className="text-gray-400">
            Discover and manage your TV series collection
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search TV series..."
                defaultValue={searchQuery}
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
                {genres?.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Returning Series">
                  Returning Series
                </SelectItem>
                <SelectItem value="Ended">Ended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={params.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="firstAirDate">Year</SelectItem>
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
            {seriesData?.meta ? (
              <>
                Showing {(seriesData.meta.page - 1) * seriesData.meta.limit + 1}{" "}
                -{" "}
                {Math.min(
                  seriesData.meta.page * seriesData.meta.limit,
                  seriesData.meta.total
                )}{" "}
                of {seriesData.meta.total} TV series
              </>
            ) : (
              "Loading series..."
            )}
          </p>
        </div>

        {/* Series Grid/List */}
        {seriesLoading ? (
          <LoadingGrid viewMode={viewMode} />
        ) : filteredSeries.length ? (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
                  : "space-y-4"
              }
            >
              {filteredSeries.map((series) => (
                <SeriesCard
                  key={series.id}
                  series={series}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Load More Button */}
            {seriesData?.meta &&
              seriesData.meta.page < seriesData.meta.totalPages && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleLoadMore}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={seriesLoading}
                  >
                    {seriesLoading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No TV series found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
