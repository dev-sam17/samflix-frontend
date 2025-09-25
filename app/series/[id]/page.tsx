import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Download, Tv, Star, Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import SeasonSection from "./seasonSection";

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const series = await api.server.series.getById(id);
  const totalEpisodes = series.episodes.length;
  
  // Calculate seasons from episodes
  const seasons = Array.from(
    new Set(series.episodes.map(ep => ep.seasonNumber))
  ).sort((a, b) => a - b).map(seasonNumber => ({
    seasonNumber,
    episodes: series.episodes.filter(ep => ep.seasonNumber === seasonNumber)
  }));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <Image
          src={api.utils.getTmdbImageUrl(series.backdropPath || "", "original")}
          alt={series.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link href="/series">
            <Button
              variant="outline"
              size="sm"
              className="bg-black/50 border-gray-600 text-white hover:bg-black/70 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Series
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <Card className="group bg-gray-900/80 border-gray-800 hover:border-red-500/50 transition-all duration-300 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                  <Image
                    src={api.utils.getTmdbImageUrl(series.posterPath || "", "w500")}
                    alt={series.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-300 flex-wrap">
                <Badge className="bg-red-600 text-white border-red-600">
                  <Tv className="w-3 h-3 mr-1" />
                  TV Series
                </Badge>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {series.firstAirDate ? new Date(series.firstAirDate).getFullYear() : "Unknown"}
                  </span>
                  {series.lastAirDate && (
                    <>
                      <span>-</span>
                      <span>{new Date(series.lastAirDate).getFullYear()}</span>
                    </>
                  )}
                </div>
                <Badge
                  className={
                    series.status === "Ended"
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-green-600 text-white border-green-600"
                  }
                >
                  {series.status}
                </Badge>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                {series.title}
              </h1>

              <div className="flex gap-2 flex-wrap">
                {series.genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-400 transition-colors"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>

              <p className="text-gray-300 text-lg leading-relaxed">
                {series.overview}
              </p>

              <div className="flex gap-4">
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  <Play className="w-5 h-5 mr-2" />
                  Play Latest
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-500 text-white hover:bg-white/10"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Season
                </Button>
              </div>
            </div>

            {/* Series Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gray-900/50 border-gray-800 hover:border-red-500/30 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {seasons.length}
                  </div>
                  <div className="text-sm text-gray-400">Seasons</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800 hover:border-red-500/30 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {totalEpisodes}
                  </div>
                  <div className="text-sm text-gray-400">Episodes</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800 hover:border-red-500/30 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {series.firstAirDate ? new Date(series.firstAirDate).getFullYear() : "N/A"}
                  </div>
                  <div className="text-sm text-gray-400">First Aired</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mt-12">
          <Tabs defaultValue="episodes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-gray-800">
              <TabsTrigger
                value="episodes"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Episodes
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="episodes" className="mt-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Episodes</h2>
                <div className="space-y-4">
                  {seasons.map((season) => (
                    <SeasonSection key={season.seasonNumber} season={season} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">
                  Series Details
                </h2>
                <Card className="bg-gray-900/50 border-gray-800 hover:border-red-500/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-400">
                              First Air Date
                            </div>
                            <div className="text-white">
                              {series.firstAirDate ? new Date(series.firstAirDate).toLocaleDateString() : "Unknown"}
                            </div>
                          </div>
                          {series.lastAirDate && (
                            <div>
                              <div className="text-sm text-gray-400">
                                Last Air Date
                              </div>
                              <div className="text-white">
                                {new Date(series.lastAirDate).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm text-gray-400">Status</div>
                            <Badge
                              className={
                                series.status === "Ended"
                                  ? "bg-red-600 text-white border-red-600"
                                  : "bg-green-600 text-white border-green-600"
                              }
                            >
                              {series.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Genres
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          {series.genres.map((genre) => (
                            <Badge
                              key={genre}
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-400 transition-colors"
                            >
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
