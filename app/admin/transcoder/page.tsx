"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Search, 
  RefreshCw, 
  Film, 
  Tv, 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { TranscodeStatus, Movie, TvSeries, Episode } from "@/lib/types";
import {
  useApiWithContext,
  useMutationWithContext,
} from "@/hooks/use-api-with-context";
import { useApiUrl } from "@/contexts/api-url-context";

// Helper component for status badge
function StatusBadge({ status }: { status: TranscodeStatus }) {
  switch (status) {
    case TranscodeStatus.PENDING:
      return (
        <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">
          Pending
        </Badge>
      );
    case TranscodeStatus.IN_PROGRESS:
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
          In Progress
        </Badge>
      );
    case TranscodeStatus.QUEUED:
      return (
        <Badge className="bg-gray-600 hover:bg-gray-700 text-white">
          Queued
        </Badge>
      );
    case TranscodeStatus.COMPLETED:
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          Completed
        </Badge>
      );
    case TranscodeStatus.FAILED:
      return (
        <Badge className="bg-red-600 hover:bg-red-700 text-white">Failed</Badge>
      );
    default:
      return <Badge className="border-gray-500 text-gray-400">Unknown</Badge>;
  }
}

// Movie table component
function MovieTable() {
  const baseUrl = useApiUrl();
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<Array<Movie>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    Record<string, TranscodeStatus>
  >({});
  const [updatingMovies, setUpdatingMovies] = useState<Record<string, boolean>>(
    {}
  );
  const [statusFilter, setStatusFilter] = useState<TranscodeStatus | "ALL">(
    "ALL"
  );

  // Fetch movies using the existing API
  const {
    data: moviesData,
    loading: isLoading,
    error,
    refetch,
  } = useApiWithContext(
    (baseUrl) => () =>
      api.client.movies.getAll({
        baseUrl,
        page: 1,
        limit: 100,
        search: searchQuery,
      })
  );

  // Update transcode status mutation
  const { mutate: updateStatus } = useMutationWithContext(
    (baseUrl: string) => (params: { id: string; status: string }) =>
      api.client.transcode.updateMovieStatus(baseUrl, params.id, params.status)
  );

  useEffect(() => {
    if (moviesData) {
      setMovies(moviesData.data);
      setLoading(false);
    }
  }, [moviesData]);

  const handleSearch = () => {
    setLoading(true);
    refetch();
  };

  const handleStatusChange = (movieId: string, status: TranscodeStatus) => {
    setSelectedStatus((prev) => ({ ...prev, [movieId]: status }));
  };

  const handleUpdateStatus = async (movieId: string) => {
    const status = selectedStatus[movieId];
    if (!status) {
      toast.error("Please select a status first");
      return;
    }

    try {
      setUpdatingMovies((prev) => ({ ...prev, [movieId]: true }));
      const result = await updateStatus({ id: movieId, status });
      
      // Update the local state immediately
      setMovies((prevMovies) =>
        prevMovies.map((movie) =>
          movie.id === movieId
            ? { ...movie, transcodeStatus: result.data.transcodeStatus as TranscodeStatus }
            : movie
        )
      );
      
      // Clear the selected status for this movie
      setSelectedStatus((prev) => {
        const newState = { ...prev };
        delete newState[movieId];
        return newState;
      });
      
      toast.success(`Updated status for ${result.data.title} to ${result.data.transcodeStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingMovies((prev) => ({ ...prev, [movieId]: false }));
    }
  };

  // Filter movies based on search query and status filter
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      !searchQuery ||
      movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || movie.transcodeStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs bg-gray-900 border-gray-700 focus:border-red-500 focus:ring-red-500/20"
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as TranscodeStatus | "ALL")
              }
            >
              <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value={TranscodeStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={TranscodeStatus.QUEUED}>Queued</SelectItem>
                <SelectItem value={TranscodeStatus.IN_PROGRESS}>
                  In Progress
                </SelectItem>
                <SelectItem value={TranscodeStatus.COMPLETED}>
                  Completed
                </SelectItem>
                <SelectItem value={TranscodeStatus.FAILED}>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSearch} variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        <Button onClick={() => refetch()} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading movies...</div>
      ) : (
        <Table className="border border-gray-700 rounded-md overflow-hidden">
          <TableHeader className="bg-gray-800">
            <TableRow className="hover:bg-gray-800/80 border-b border-gray-700">
              <TableHead className="text-white">Title</TableHead>
              <TableHead className="text-white">Current Status</TableHead>
              <TableHead className="text-white">New Status</TableHead>
              <TableHead className="text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No movies found
                </TableCell>
              </TableRow>
            ) : (
              filteredMovies.map((movie) => (
                <TableRow
                  key={movie.id}
                  className="hover:bg-gray-800/50 border-b border-gray-700"
                >
                  <TableCell className="font-medium">{movie.title}</TableCell>
                  <TableCell>
                    <StatusBadge status={movie.transcodeStatus} />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={selectedStatus[movie.id] || ""}
                      onValueChange={(value) =>
                        handleStatusChange(movie.id, value as TranscodeStatus)
                      }
                    >
                      <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value={TranscodeStatus.PENDING}>
                          Pending
                        </SelectItem>
                        <SelectItem value={TranscodeStatus.IN_PROGRESS}>
                          In Progress
                        </SelectItem>
                        <SelectItem value={TranscodeStatus.QUEUED}>
                          Queued
                        </SelectItem>
                        <SelectItem value={TranscodeStatus.COMPLETED}>
                          Completed
                        </SelectItem>
                        <SelectItem value={TranscodeStatus.FAILED}>
                          Failed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleUpdateStatus(movie.id)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={updatingMovies[movie.id]}
                    >
                      {updatingMovies[movie.id] ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          Updating...
                        </>
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// Episode table component
function EpisodeTable() {
  const baseUrl = useApiUrl();
  const [searchQuery, setSearchQuery] = useState("");
  const [allEpisodes, setAllEpisodes] = useState<Array<EpisodeWithSeries>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    Record<string, TranscodeStatus>
  >({});
  const [updatingEpisodes, setUpdatingEpisodes] = useState<
    Record<string, boolean>
  >({});
  const [statusFilter, setStatusFilter] = useState<TranscodeStatus | "ALL">(
    "ALL"
  );

  // Fetch series using the existing API
  const {
    data: seriesData,
    loading: isLoading,
    error,
    refetch,
  } = useApiWithContext(
    (baseUrl) => () =>
      api.client.series.getAll({
        baseUrl,
        page: 1,
        limit: 100,
        search: searchQuery,
      })
  );

  // Define episode type
  type EpisodeWithSeries = {
    id: string;
    title: string;
    seriesTitle: string;
    seasonNumber: number;
    episodeNumber: number;
    transcodeStatus: TranscodeStatus;
  };

  // Update transcode status mutation
  const { mutate: updateStatus } = useMutationWithContext(
    (baseUrl: string) => (params: { id: string; status: string }) =>
      api.client.transcode.updateEpisodeStatus(
        baseUrl,
        params.id,
        params.status
      )
  );

  // Fetch episodes for each series
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (seriesData?.data) {
        const allEpisodesPromises = seriesData.data.map(
          async (series: TvSeries) => {
            try {
              // Get all seasons (assuming season numbers start from 1)
              const maxSeasons = 10; // Limit to avoid too many requests
              let allSeriesEpisodes: any[] = [];

              for (let season = 1; season <= maxSeasons; season++) {
                try {
                  const episodes = await api.client.series.getEpisodesBySeason(
                    series.id,
                    season,
                    baseUrl ? baseUrl.toString() : ""
                  );

                  if (episodes && episodes.length > 0) {
                    const mappedEpisodes = episodes.map(
                      (episode) =>
                        ({
                          id: episode.id,
                          title: episode.title,
                          seriesTitle: series.title,
                          seasonNumber: episode.seasonNumber,
                          episodeNumber: episode.episodeNumber,
                          transcodeStatus: episode.transcodeStatus,
                        } as EpisodeWithSeries)
                    );

                    allSeriesEpisodes = [
                      ...allSeriesEpisodes,
                      ...mappedEpisodes,
                    ];
                  }
                } catch (error) {
                  // Season might not exist, continue to the next one
                  continue;
                }
              }

              return allSeriesEpisodes;
            } catch (error) {
              console.error(
                `Error fetching episodes for series ${series.title}:`,
                error
              );
              return [];
            }
          }
        );

        const episodesArrays = await Promise.all(allEpisodesPromises);
        const flattenedEpisodes = episodesArrays.flat();
        setAllEpisodes(flattenedEpisodes);
        setLoading(false);
      }
    };

    if (seriesData) {
      fetchEpisodes();
    }
  }, [seriesData, baseUrl]);

  const handleSearch = () => {
    setLoading(true);
    refetch();
  };

  const handleStatusChange = (episodeId: string, status: TranscodeStatus) => {
    setSelectedStatus((prev) => ({ ...prev, [episodeId]: status }));
  };

  const handleUpdateStatus = async (episodeId: string) => {
    const status = selectedStatus[episodeId];
    if (!status) {
      toast.error("Please select a status first");
      return;
    }

    try {
      setUpdatingEpisodes((prev) => ({ ...prev, [episodeId]: true }));
      const result = await updateStatus({ id: episodeId, status });
      
      // Update the local state immediately
      setAllEpisodes((prevEpisodes) =>
        prevEpisodes.map((episode) =>
          episode.id === episodeId
            ? { ...episode, transcodeStatus: result.data.transcodeStatus as TranscodeStatus }
            : episode
        )
      );
      
      // Clear the selected status for this episode
      setSelectedStatus((prev) => {
        const newState = { ...prev };
        delete newState[episodeId];
        return newState;
      });
      
      toast.success(`Updated status for ${result.data.title} to ${result.data.transcodeStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingEpisodes((prev) => ({ ...prev, [episodeId]: false }));
    }
  };

  // Filter episodes based on search query and status filter
  const filteredEpisodes = allEpisodes.filter((episode: EpisodeWithSeries) => {
    const matchesSearch =
      !searchQuery ||
      episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      episode.seriesTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || episode.transcodeStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search episodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as TranscodeStatus | "ALL")
              }
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white focus:ring-red-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value={TranscodeStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={TranscodeStatus.QUEUED}>Queued</SelectItem>
                <SelectItem value={TranscodeStatus.IN_PROGRESS}>
                  In Progress
                </SelectItem>
                <SelectItem value={TranscodeStatus.COMPLETED}>
                  Completed
                </SelectItem>
                <SelectItem value={TranscodeStatus.FAILED}>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSearch} variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        <Button onClick={() => refetch()} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading episodes...</div>
      ) : (
        <Table className="border border-gray-700 rounded-md overflow-hidden">
          <TableHeader className="bg-gray-800">
            <TableRow className="hover:bg-gray-800/80 border-b border-gray-700">
              <TableHead className="text-white">Series</TableHead>
              <TableHead className="text-white">Episode</TableHead>
              <TableHead className="text-white">Current Status</TableHead>
              <TableHead className="text-white">New Status</TableHead>
              <TableHead className="text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEpisodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No episodes found
                </TableCell>
              </TableRow>
            ) : (
              filteredEpisodes.map((episode) => (
                <TableRow
                  key={episode.id}
                  className="hover:bg-gray-800/50 border-b border-gray-700"
                >
                  <TableCell className="font-medium">
                    {episode.seriesTitle}
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-300">{`S${episode.seasonNumber}E${episode.episodeNumber}: `}</span>
                    <span>{episode.title}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={episode.transcodeStatus} />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={selectedStatus[episode.id] || ""}
                      onValueChange={(value) =>
                        handleStatusChange(episode.id, value as TranscodeStatus)
                      }
                    >
                      <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value={TranscodeStatus.PENDING}>
                          Pending
                        </SelectItem>
                        <SelectItem value={TranscodeStatus.IN_PROGRESS}>
                          In Progress
                        </SelectItem>
                        <SelectItem value={TranscodeStatus.COMPLETED}>
                          Completed
                        </SelectItem>
                        <SelectItem value={TranscodeStatus.FAILED}>
                          Failed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleUpdateStatus(episode.id)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={updatingEpisodes[episode.id]}
                    >
                      {updatingEpisodes[episode.id] ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          Updating...
                        </>
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// Main Transcoder Page Component
export default function TranscoderPage() {
  // Get health data for system status
  const { data: healthData } = useApiWithContext(
    (baseUrl) => () => api.client.system.healthCheck(baseUrl),
    []
  );

  // Mock statistics - in a real app, you'd fetch these from your API
  const stats = {
    totalMovies: 0, // You can implement API calls to get actual counts
    totalEpisodes: 0,
    completedItems: 0,
    pendingItems: 0,
    failedItems: 0,
    inProgressItems: 0
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-600/20 rounded-lg">
              <PlayCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Transcoder Manager</h1>
              <p className="text-gray-400">
                Manage video transcoding status for movies and TV episodes
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.completedItems}
              </div>
              <div className="text-sm text-gray-400">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.pendingItems}
              </div>
              <div className="text-sm text-gray-400">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.inProgressItems}
              </div>
              <div className="text-sm text-gray-400">In Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/30">
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.failedItems}
              </div>
              <div className="text-sm text-gray-400">Failed</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-gray-800">
            <TabsTrigger
              value="movies"
              className="data-[state=active]:bg-red-600 flex items-center gap-2"
            >
              <Film className="w-4 h-4" />
              Movies
            </TabsTrigger>
            <TabsTrigger
              value="episodes"
              className="data-[state=active]:bg-red-600 flex items-center gap-2"
            >
              <Tv className="w-4 h-4" />
              TV Episodes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-red-400" />
                  Movie Transcoding Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MovieTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="episodes" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-red-400" />
                  Episode Transcoding Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EpisodeTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
