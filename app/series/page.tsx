"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Grid, List, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock data
const series = [
  {
    id: "1",
    title: "Breaking Bad",
    firstAirDate: "2008-01-20",
    lastAirDate: "2013-09-29",
    status: "Ended",
    genres: ["Crime", "Drama", "Thriller"],
    posterPath: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    backdropPath: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    overview:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    episodes: [
      { seasonNumber: 1, episodeCount: 7 },
      { seasonNumber: 2, episodeCount: 13 },
      { seasonNumber: 3, episodeCount: 13 },
      { seasonNumber: 4, episodeCount: 13 },
      { seasonNumber: 5, episodeCount: 16 },
    ],
  },
  {
    id: "2",
    title: "Stranger Things",
    firstAirDate: "2016-07-15",
    lastAirDate: null,
    status: "Returning Series",
    genres: ["Drama", "Fantasy", "Horror"],
    posterPath: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdropPath: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    overview:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    episodes: [
      { seasonNumber: 1, episodeCount: 8 },
      { seasonNumber: 2, episodeCount: 9 },
      { seasonNumber: 3, episodeCount: 8 },
      { seasonNumber: 4, episodeCount: 9 },
    ],
  },
  {
    id: "3",
    title: "The Witcher",
    firstAirDate: "2019-12-20",
    lastAirDate: null,
    status: "Returning Series",
    genres: ["Action", "Adventure", "Drama", "Fantasy"],
    posterPath: "/7vjaCdMw15FEbXyLQTVa04URsPm.jpg",
    backdropPath: "/wmN8aTqtOdKirOKJca4KRMWnbOE.jpg",
    overview:
      "Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world where people often prove more wicked than beasts.",
    episodes: [
      { seasonNumber: 1, episodeCount: 8 },
      { seasonNumber: 2, episodeCount: 8 },
      { seasonNumber: 3, episodeCount: 8 },
    ],
  },
]

const genres = ["Action", "Adventure", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller"]

function SeriesCard({ series, viewMode }: { series: any; viewMode: "grid" | "list" }) {
  const totalEpisodes = series.episodes.reduce((sum: number, season: any) => sum + season.episodeCount, 0)
  const totalSeasons = series.episodes.length

  if (viewMode === "list") {
    return (
      <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:bg-gray-800/50">
        <CardContent className="p-0">
          <div className="flex gap-4">
            <div className="relative w-24 h-36 flex-shrink-0">
              <Image
                src={`https://image.tmdb.org/t/p/w300${series.posterPath}`}
                alt={series.title}
                fill
                className="object-cover rounded-l-lg"
              />
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{series.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <span>{new Date(series.firstAirDate).getFullYear()}</span>
                    <span>
                      {totalSeasons} Season{totalSeasons > 1 ? "s" : ""}
                    </span>
                    <span>{totalEpisodes} Episodes</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className={series.status === "Ended" ? "bg-red-600 text-white" : "bg-green-600 text-white"}
                  >
                    {series.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {series.genres.map((genre: string) => (
                  <Badge key={genre} variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {genre}
                  </Badge>
                ))}
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{series.overview}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Link href={`/series/${series.id}`}>
      <Card className="group bg-gray-900/50 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
          <Image
            src={`https://image.tmdb.org/t/p/w500${series.posterPath}`}
            alt={series.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className={series.status === "Ended" ? "bg-red-600 text-white" : "bg-green-600 text-white"}
            >
              {series.status === "Ended" ? "Ended" : "Ongoing"}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            <div className="text-white text-sm">
              <div>
                {totalSeasons} Season{totalSeasons > 1 ? "s" : ""}
              </div>
              <div className="text-xs text-gray-300">{totalEpisodes} Episodes</div>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-white mb-2 line-clamp-1">{series.title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>{new Date(series.firstAirDate).getFullYear()}</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {series.status}
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {series.genres.slice(0, 2).map((genre: string) => (
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

export default function SeriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("title")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filteredSeries, setFilteredSeries] = useState(series)

  useEffect(() => {
    let filtered = series

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by genre
    if (selectedGenre !== "all") {
      filtered = filtered.filter((s) => s.genres.includes(selectedGenre))
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((s) => s.status.toLowerCase().includes(selectedStatus.toLowerCase()))
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "year":
          return new Date(b.firstAirDate).getFullYear() - new Date(a.firstAirDate).getFullYear()
        case "episodes":
          const aEpisodes = a.episodes.reduce((sum, season) => sum + season.episodeCount, 0)
          const bEpisodes = b.episodes.reduce((sum, season) => sum + season.episodeCount, 0)
          return bEpisodes - aEpisodes
        default:
          return 0
      }
    })

    setFilteredSeries(filtered)
  }, [searchQuery, selectedGenre, selectedStatus, sortBy])

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

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">TV Series</h1>
          <p className="text-gray-400">Discover and manage your TV series collection</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search TV series..."
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
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="returning">Returning Series</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="episodes">Episodes</SelectItem>
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
            Showing {filteredSeries.length} of {series.length} TV series
          </p>
        </div>

        {/* Series Grid/List */}
        <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" : "space-y-4"}>
          {filteredSeries.map((s) => (
            <SeriesCard key={s.id} series={s} viewMode={viewMode} />
          ))}
        </div>

        {filteredSeries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No TV series found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
