"use client";

import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HLSPlayer } from "@/components/hls-player";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { TranscodeStatus } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useApiUrl } from "@/contexts/api-url-context";
import { clientApi } from "@/lib/api";

export function EpisodeCard({
  episode,
  seasonNumber,
  seriesId,
}: {
  episode: any;
  seasonNumber: number;
  seriesId: string;
}) {
  const [isPlayerOpen, setIsPlayerOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const { apiBaseUrl } = useApiUrl();

  // Handle saving series progress
  const handleTimeUpdate = useCallback(
    async (currentTime: number) => {
      if (!isAuthenticated || !user || !episode.id || !seriesId) return;

      try {
        if (!apiBaseUrl) {
          console.error("API base URL is not configured");
          return;
        }
        await clientApi.progress.saveSeriesProgress(
          apiBaseUrl,
          user.id,
          seriesId,
          episode.id.toString(),
          currentTime
        );
      } catch (error) {
        console.error("Error saving series progress:", error);
      }
    },
    [isAuthenticated, user, episode.id, seriesId, apiBaseUrl]
  );

  return (
    <>
      <Card className="group bg-gray-900/60 border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:bg-gray-800/60 h-full">
        <CardContent className="p-3 h-full flex flex-col">
          {/* Episode Number and Title */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-600/20 border border-red-500/30 rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-red-400">
                {episode.episodeNumber.toString().padStart(2, "0")}
              </span>
            </div>
            <h4 className="font-medium text-white text-sm line-clamp-1 group-hover:text-red-400 transition-colors flex-1">
              {episode.title}
            </h4>
          </div>

          {/* Episode Info */}
          <div className="flex items-center justify-end text-xs text-gray-400 mb-2">
            <Badge
              variant="outline"
              className="border-gray-600/50 text-gray-400 text-xs px-1 py-0"
            >
              {episode.quality}
            </Badge>
          </div>

          {/* Description - Minimal */}
          <p className="text-gray-500 text-xs line-clamp-2 mb-3 flex-1">
            {episode.overview}
          </p>

          {/* Play Button - Compact */}
          <div className="mt-auto">
            {episode.playPath &&
              episode.transcodeStatus === TranscodeStatus.COMPLETED && (
                <>
                  {isAuthenticated ? (
                    <Button
                      size="sm"
                      className="w-full bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                      onClick={() => setIsPlayerOpen(true)}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Play
                    </Button>
                  ) : (
                    <SignInButton
                      mode="modal"
                      fallbackRedirectUrl={window.location.href}
                    >
                      <Button
                        size="sm"
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                    </SignInButton>
                  )}
                </>
              )}
            {(episode.transcodeStatus === TranscodeStatus.IN_PROGRESS ||
              episode.transcodeStatus === TranscodeStatus.QUEUED) && (
              <Button
                size="sm"
                className={`w-full cursor-not-allowed text-xs h-7 ${
                  episode.transcodeStatus === TranscodeStatus.IN_PROGRESS
                    ? "bg-yellow-600 text-black hover:bg-yellow-600"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-700"
                }`}
                disabled
              >
                <Clock className="w-3 h-3 mr-1" />
                {episode.transcodeStatus === TranscodeStatus.IN_PROGRESS
                  ? "UPLOADING"
                  : "QUEUED"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* HLS Player Dialog */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-6xl p-0 bg-black border-gray-800">
          <VisuallyHidden>
            <DialogTitle>
              {episode.title} - S{seasonNumber}E{episode.episodeNumber}
            </DialogTitle>
          </VisuallyHidden>
          <HLSPlayer
            src={
              apiBaseUrl && episode.playPath
                ? new URL(apiBaseUrl + episode.playPath).toString()
                : ""
            }
            title={`${episode.title} - S${seasonNumber}E${episode.episodeNumber}`}
            onBack={() => setIsPlayerOpen(false)}
            autoPlay={true}
            tmdbId={episode.id?.toString()}
            clerkId={user?.id}
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
    </>
  );
}
