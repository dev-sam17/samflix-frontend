"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { useToast } from "@/hooks/use-toast";
import { Search, RefreshCw, Film, Tv } from "lucide-react";
import { api } from "@/lib/api";
import { TranscodeStatus, Movie, TvSeries, Episode } from "@/lib/types";
import {
  useApiWithContext,
  useMutationWithContext,
} from "@/hooks/use-api-with-context";
import { useApiUrl } from "@/contexts/api-url-context";
import { ApiUrlContextType } from "@/contexts/api-url-context";

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
  const { toast } = useToast();
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
      toast({
        title: "Error",
        description: "Please select a status first",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingMovies((prev) => ({ ...prev, [movieId]: true }));
      const result = await updateStatus({ id: movieId, status });
      toast({
        title: "Success",
        description: `Updated status for ${result.data.title} to ${result.data.transcodeStatus}`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
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
  const { toast } = useToast();
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
      toast({
        title: "Error",
        description: "Please select a status first",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingEpisodes((prev) => ({ ...prev, [episodeId]: true }));
      const result = await updateStatus({ id: episodeId, status });
      toast({
        title: "Success",
        description: `Updated status for ${result.data.title} to ${result.data.transcodeStatus}`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
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
  return (
    <div className="p-6 md:p-8 bg-gradient-to-b from-gray-900 to-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Transcode Management
      </h1>
      <Accordion
        type="single"
        collapsible
        className="mb-6 bg-gray-800/50 rounded-lg border border-gray-700"
      >
        <AccordionItem value="movies">
          <AccordionTrigger className="text-xl font-semibold text-white px-4 py-2 hover:bg-gray-700/50">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-red-500" />
              Movies
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <MovieTable />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="episodes">
          <AccordionTrigger className="text-xl font-semibold text-white px-4 py-2 hover:bg-gray-700/50">
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-red-500" />
              TV Series Episodes
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <EpisodeTable />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
