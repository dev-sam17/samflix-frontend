"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Download, Calendar, Tv, Clock, ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import Image from "next/image"

// Mock data for a single series
const series = {
  id: "1",
  title: "Breaking Bad",
  firstAirDate: "2008-01-20",
  lastAirDate: "2013-09-29",
  status: "Ended",
  genres: ["Crime", "Drama", "Thriller"],
  posterPath: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
  backdropPath: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
  overview:
    "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future. Set in Albuquerque, New Mexico, the series follows Walter White, a struggling high school chemistry teacher who is diagnosed with stage three lung cancer.",
  seasons: [
    {
      seasonNumber: 1,
      episodes: [
        {
          episodeNumber: 1,
          title: "Pilot",
          overview: "Walter White, a struggling high school chemistry teacher, is diagnosed with lung cancer.",
          airDate: "2008-01-20",
          runtime: 58,
          fileName: "Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264-EXAMPLE.mkv",
          filePath: "/series/Breaking Bad/Season 01/Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264-EXAMPLE.mkv",
          quality: "HD",
          resolution: "1080p",
        },
        {
          episodeNumber: 2,
          title: "Cat's in the Bag...",
          overview: "Walt and Jesse attempt to tie up loose ends.",
          airDate: "2008-01-27",
          runtime: 48,
          fileName: "Breaking.Bad.S01E02.Cats.in.the.Bag.1080p.BluRay.x264-EXAMPLE.mkv",
          filePath: "/series/Breaking Bad/Season 01/Breaking.Bad.S01E02.Cats.in.the.Bag.1080p.BluRay.x264-EXAMPLE.mkv",
          quality: "HD",
          resolution: "1080p",
        },
      ],
    },
    {
      seasonNumber: 2,
      episodes: [
        {
          episodeNumber: 1,
          title: "Seven Thirty-Seven",
          overview: "Walt and Jesse are vividly reminded of Tuco's volatile nature.",
          airDate: "2009-03-08",
          runtime: 47,
          fileName: "Breaking.Bad.S02E01.Seven.Thirty-Seven.1080p.BluRay.x264-EXAMPLE.mkv",
          filePath:
            "/series/Breaking Bad/Season 02/Breaking.Bad.S02E01.Seven.Thirty-Seven.1080p.BluRay.x264-EXAMPLE.mkv",
          quality: "HD",
          resolution: "1080p",
        },
      ],
    },
  ],
}

function EpisodeCard({ episode, seasonNumber }: { episode: any; seasonNumber: number }) {
  return (
    <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:bg-gray-800/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="text-center">
              <div className="text-xs text-gray-400">S{seasonNumber.toString().padStart(2, "0")}</div>
              <div className="text-sm font-semibold text-white">
                E{episode.episodeNumber.toString().padStart(2, "0")}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white line-clamp-1">{episode.title}</h4>
              <div className="flex gap-2 ml-4">
                <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                  {episode.quality}
                </Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                  {episode.resolution}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(episode.airDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {episode.runtime}m
              </div>
            </div>

            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{episode.overview}</p>

            <div className="flex gap-2">
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <Play className="w-3 h-3 mr-1" />
                Play
              </Button>
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/10">
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SeasonSection({ season }: { season: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-600 transition-all duration-300 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="font-semibold text-white">S{season.seasonNumber}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Season {season.seasonNumber}</h3>
                  <p className="text-sm text-gray-400">{season.episodes.length} episodes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {season.episodes.length} Episodes
                </Badge>
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 mt-4">
        {season.episodes.map((episode: any) => (
          <EpisodeCard key={episode.episodeNumber} episode={episode} seasonNumber={season.seasonNumber} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function SeriesDetailPage({ params }: { params: { id: string } }) {
  const totalEpisodes = series.seasons.reduce((sum, season) => sum + season.episodes.length, 0)

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
              <Link href="/movies" className="hover:text-red-400 transition-colors">
                Movies
              </Link>
              <Link href="/series" className="text-red-400">
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

      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <Image
          src={`https://image.tmdb.org/t/p/original${series.backdropPath}`}
          alt={series.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${series.posterPath}`}
                    alt={series.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  <Tv className="w-3 h-3 mr-1" />
                  TV Series
                </Badge>
                <span>{new Date(series.firstAirDate).getFullYear()}</span>
                {series.lastAirDate && (
                  <>
                    <span>-</span>
                    <span>{new Date(series.lastAirDate).getFullYear()}</span>
                  </>
                )}
                <span>•</span>
                <Badge
                  variant="secondary"
                  className={series.status === "Ended" ? "bg-red-600 text-white" : "bg-green-600 text-white"}
                >
                  {series.status}
                </Badge>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white">{series.title}</h1>

              <div className="flex gap-2 flex-wrap">
                {series.genres.map((genre) => (
                  <Badge key={genre} variant="outline" className="border-gray-500 text-gray-300">
                    {genre}
                  </Badge>
                ))}
              </div>

              <p className="text-gray-300 text-lg leading-relaxed">{series.overview}</p>

              <div className="flex gap-4">
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  <Play className="w-5 h-5 mr-2" />
                  Play Latest
                </Button>
                <Button size="lg" variant="outline" className="border-gray-500 text-white hover:bg-white/10">
                  <Download className="w-5 h-5 mr-2" />
                  Download Season
                </Button>
              </div>
            </div>

            {/* Series Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{series.seasons.length}</div>
                  <div className="text-sm text-gray-400">Seasons</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{totalEpisodes}</div>
                  <div className="text-sm text-gray-400">Episodes</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{new Date(series.firstAirDate).getFullYear()}</div>
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
              <TabsTrigger value="episodes" className="data-[state=active]:bg-red-600">
                Episodes
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-red-600">
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="episodes" className="mt-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Episodes</h2>
                <div className="space-y-4">
                  {series.seasons.map((season) => (
                    <SeasonSection key={season.seasonNumber} season={season} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Series Details</h2>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Information</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-400">First Air Date</div>
                            <div className="text-white">{new Date(series.firstAirDate).toLocaleDateString()}</div>
                          </div>
                          {series.lastAirDate && (
                            <div>
                              <div className="text-sm text-gray-400">Last Air Date</div>
                              <div className="text-white">{new Date(series.lastAirDate).toLocaleDateString()}</div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm text-gray-400">Status</div>
                            <Badge
                              variant="secondary"
                              className={
                                series.status === "Ended" ? "bg-red-600 text-white" : "bg-green-600 text-white"
                              }
                            >
                              {series.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Genres</h3>
                        <div className="flex gap-2 flex-wrap">
                          {series.genres.map((genre) => (
                            <Badge key={genre} variant="outline" className="border-gray-600 text-gray-300">
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
  )
}
