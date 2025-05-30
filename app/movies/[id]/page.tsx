import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Download, Star, Clock, HardDrive, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { api, type Movie } from "@/lib/api"
import { Suspense } from "react"

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 -mt-32 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-800 rounded w-3/4 animate-pulse" />
            <div className="h-12 bg-gray-800 rounded animate-pulse" />
            <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded animate-pulse" />
              <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-gray-800 rounded w-4/6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MovieHeader({ movie }: { movie: Movie }) {
  return (
    <>
      <div className="relative h-[60vh] overflow-hidden">
        {movie.backdropPath ? (
          <Image
            src={api.utils.getTmdbImageUrl(movie.backdropPath, "original") || "/placeholder.svg"}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-48 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl max-w-[300px] mx-auto">
              <Image
                src={movie.posterPath ? api.utils.getTmdbImageUrl(movie.posterPath, "w300") : "/placeholder.svg"}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-3 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-red-600 text-white">
                  {movie.year}
                </Badge>
                {movie.rating && (
                  <Badge variant="secondary" className="bg-yellow-600 text-white flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {movie.rating}
                  </Badge>
                )}
                {movie.runtime && (
                  <Badge variant="outline" className="border-gray-600 text-gray-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {movie.runtime} min
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold text-white">{movie.title}</h1>

              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre) => (
                  <Badge key={genre} variant="outline" className="border-gray-600 text-gray-300">
                    {genre}
                  </Badge>
                ))}
              </div>

              {movie.overview && <p className="text-gray-300 leading-relaxed">{movie.overview}</p>}

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  <Play className="w-5 h-5 mr-2" />
                  Play Now
                </Button>
                <Button size="lg" variant="outline" className="border-gray-500 text-white hover:bg-white/10">
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function MovieTechnicalDetails({ movie }: { movie: Movie }) {
  if (!movie.quality && !movie.resolution && !movie.rip && !movie.sound) {
    return null
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Technical Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {movie.quality && (
            <div>
              <div className="text-sm text-gray-400 mb-1">Quality</div>
              <Badge variant="secondary" className="bg-green-600 text-white">
                {movie.quality}
              </Badge>
            </div>
          )}
          {movie.resolution && (
            <div>
              <div className="text-sm text-gray-400 mb-1">Resolution</div>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {movie.resolution}
              </Badge>
            </div>
          )}
          {movie.rip && (
            <div>
              <div className="text-sm text-gray-400 mb-1">Source</div>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {movie.rip}
              </Badge>
            </div>
          )}
          {movie.sound && (
            <div>
              <div className="text-sm text-gray-400 mb-1">Audio</div>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {movie.sound}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MovieFileInfo({ movie }: { movie: Movie }) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          File Information
        </h3>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-400 mb-1">File Name</div>
            <code className="text-sm bg-gray-800 px-2 py-1 rounded text-green-400 break-all">{movie.fileName}</code>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">File Path</div>
            <code className="text-sm bg-gray-800 px-2 py-1 rounded text-blue-400 break-all">{movie.filePath}</code>
          </div>
          {movie.provider && (
            <div>
              <div className="text-sm text-gray-400 mb-1">Provider</div>
              <span className="text-white">{movie.provider}</span>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-400 mb-1">Added</div>
            <span className="text-white">{new Date(movie.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await api.server.movies.getById(id)

  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
          <p className="text-gray-400 mb-6">The movie you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/movies">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Movies
            </Button>
          </Link>
        </div>
      </div>
    )
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

      <Suspense fallback={<LoadingSkeleton />}>
        <MovieHeader movie={movie} />
        <div className="container mx-auto px-4 py-4 space-y-6">
          <MovieTechnicalDetails movie={movie} />
          <MovieFileInfo movie={movie} />
        </div>
      </Suspense>
    </div>
  )
}
