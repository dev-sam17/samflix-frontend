"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { HLSPlayer } from "@/components/ui/hls-player";
import { Play, Download, Star, Clock } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { api } from "@/lib/api";
import { TranscodeStatus, type Movie } from "@/lib/types";

export function MovieHeader({ movie }: { movie: Movie }) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  console.log(movie);

  return (
    <>
      <div className="relative h-[60vh] overflow-hidden">
        {movie.backdropPath ? (
          <Image
            src={
              api.utils.getTmdbImageUrl(movie.backdropPath, "original") ||
              "/placeholder.svg"
            }
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
                src={
                  movie.posterPath
                    ? api.utils.getTmdbImageUrl(movie.posterPath, "w300")
                    : "/placeholder.svg"
                }
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
                  <Badge
                    variant="secondary"
                    className="bg-yellow-600 text-white flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" />
                    {movie.rating}
                  </Badge>
                )}
                {movie.runtime && (
                  <Badge
                    variant="outline"
                    className="border-gray-600 text-gray-300 flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    {movie.runtime} min
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold text-white">{movie.title}</h1>

              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre: string) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>

              {movie.overview && (
                <p className="text-gray-300 leading-relaxed">
                  {movie.overview}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                {movie.playPath &&
                  movie.transcodeStatus === TranscodeStatus.COMPLETED && (
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => setIsPlayerOpen(true)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                  )}
                {(movie.transcodeStatus === TranscodeStatus.IN_PROGRESS ||
                  movie.transcodeStatus === TranscodeStatus.PENDING) && (
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setIsPlayerOpen(true)}
                    disabled
                  >
                    <Play className="w-4 h-4 mr-2" />
                    UPLOADING
                  </Button>
                )}
                {/* <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HLS Player Dialog */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-6xl p-0 bg-black border-gray-800">
          <VisuallyHidden>
            <DialogTitle></DialogTitle>
          </VisuallyHidden>
          <HLSPlayer
            src={new URL(
              process.env.NEXT_PUBLIC_API_URL + movie.playPath
            ).toString()}
            title={movie.title}
            poster={
              movie.backdropPath
                ? api.utils.getTmdbImageUrl(movie.backdropPath, "original")
                : undefined
            }
            onBack={() => setIsPlayerOpen(false)}
            autoPlay={true}
            audioTracks={[
              {
                kind: "audio",
                label: "English",
                language: "en",
                default: true,
              },
              { kind: "audio", label: "Spanish", language: "es" },
            ]}
            subtitleTracks={[
              {
                kind: "subtitles",
                label: "English",
                language: "en",
                default: true,
              },
              { kind: "subtitles", label: "Spanish", language: "es" },
            ]}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
