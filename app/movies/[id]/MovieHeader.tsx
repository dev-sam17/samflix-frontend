"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { HLSPlayer } from "@/components/hls-player";
import { Play, Star, Clock, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { api, clientApi } from "@/lib/api";
import { TranscodeStatus, type Movie } from "@/lib/types";
import { runtimeFormat } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function MovieHeader({ movie }: { movie: Movie }) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState<number | null>(null);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Fetch playback progress when component mounts
  useEffect(() => {
    const fetchProgress = async () => {
      if (!isAuthenticated || !user || !movie.tmdbId) return;

      try {
        setIsLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const progress = await clientApi.progress.getProgress(
          baseUrl,
          user.id,
          movie.id.toString()
        );
        if (progress) {
          setPlaybackProgress(progress.currentTime);
        }
      } catch (error) {
        console.error("Error fetching playback progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [isAuthenticated, user, movie.id]);

  // Handle saving playback progress
  const handleTimeUpdate = useCallback(
    async (currentTime: number) => {
      if (!isAuthenticated || !user || !movie.id) return;

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        console.log({ tmdbId: movie.id });
        await clientApi.progress.saveProgress(
          baseUrl,
          user.id,
          movie.id.toString(),
          currentTime
        );
      } catch (error) {
        console.error("Error saving playback progress:", error);
      }
    },
    [isAuthenticated, user, movie.id]
  );

  // Handle deleting playback progress
  const handleDeleteProgress = useCallback(async () => {
    if (!isAuthenticated || !user || !movie.id) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      await clientApi.progress.deleteProgress(
        baseUrl,
        user.id,
        movie.id.toString()
      );
      setPlaybackProgress(null);
      toast.success("Playback progress reset");
    } catch (error) {
      console.error("Error deleting playback progress:", error);
      toast.error("Failed to reset playback progress");
    }
  }, [isAuthenticated, user, movie.tmdbId]);

  // Handle play button click
  const handlePlayClick = useCallback(() => {
    if (playbackProgress && playbackProgress > 0) {
      setIsResumeDialogOpen(true);
    } else {
      setIsPlayerOpen(true);
    }
  }, [playbackProgress]);

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
                    {runtimeFormat(movie.runtime)}
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
                <>
                  {isAuthenticated ? (
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handlePlayClick}
                      disabled={isLoading}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isLoading ? "Loading..." : "Play"}
                    </Button>
                  ) : (
                    <SignInButton
                      mode="modal"
                      fallbackRedirectUrl={window.location.href}
                    >
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                    </SignInButton>
                  )}
                  {playbackProgress !== null &&
                    playbackProgress > 0 &&
                    isAuthenticated && (
                      <Button
                        variant="outline"
                        className="text-gray-300 border-gray-700 hover:bg-gray-800"
                        onClick={handleDeleteProgress}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Progress
                      </Button>
                    )}
                </>
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
            tmdbId={movie.id.toString()}
            clerkId={user?.id}
            initialTime={playbackProgress || 0}
            onTimeUpdate={handleTimeUpdate}
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

      {/* Resume Playback Dialog */}
      <AlertDialog
        open={isResumeDialogOpen}
        onOpenChange={setIsResumeDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume Playback</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to resume watching "{movie.title}" from where you
              left off (
              {playbackProgress ? Math.floor(playbackProgress / 60) : 0}m
              {playbackProgress ? Math.floor(playbackProgress % 60) : 0}s)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteProgress}>
              Start Over
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsResumeDialogOpen(false);
                setIsPlayerOpen(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Resume
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
