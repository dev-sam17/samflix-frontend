"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HardDrive, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { MovieHeader } from "./MovieHeader";
import { useParams } from "next/navigation";
import type { Movie } from "@/lib/types";
import { useApiWithContext } from "@/hooks/use-api-with-context";

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
  );
}

function MovieTechnicalDetails({ movie }: { movie: Movie }) {
  if (!movie.quality && !movie.resolution && !movie.rip && !movie.sound) {
    return null;
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Technical Details
        </h3>
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
              <Badge
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                {movie.resolution}
              </Badge>
            </div>
          )}
          {movie.rip && (
            <div>
              <div className="text-sm text-gray-400 mb-1">Source</div>
              <Badge
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                {movie.rip}
              </Badge>
            </div>
          )}
          {movie.sound && (
            <div>
              <div className="text-sm text-gray-400 mb-1">Audio</div>
              <Badge
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                {movie.sound}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
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
            <code className="text-sm bg-gray-800 px-2 py-1 rounded text-green-400 break-all">
              {movie.fileName}
            </code>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">File Path</div>
            <code className="text-sm bg-gray-800 px-2 py-1 rounded text-blue-400 break-all">
              {movie.filePath}
            </code>
          </div>
          {movie.provider && (
            <div>
              <div className="text-sm text-gray-400 mb-1">Provider</div>
              <span className="text-white">{movie.provider}</span>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-400 mb-1">Added</div>
            <span className="text-white">
              {new Date(movie.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: movie, loading: moviesLoading } = useApiWithContext(
    (baseUrl) => () => api.client.movies.getById(id, baseUrl),
    [id]
  );

  if (moviesLoading) {
    return <LoadingSkeleton />;
  }

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
          <p className="text-gray-400 mb-6">
            The movie you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/movies">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Movies
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pb-16">
        <MovieHeader movie={movie} />

        <div className="container mx-auto px-4 py-8 space-y-8">
          <MovieTechnicalDetails movie={movie} />
          <MovieFileInfo movie={movie} />
        </div>
      </div>
    </div>
  );
}
