"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Calendar, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HLSPlayer } from "@/components/hls-player";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { TranscodeStatus } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { SignInButton } from "@clerk/nextjs";

export function EpisodeCard({
  episode,
  seasonNumber,
}: {
  episode: any;
  seasonNumber: number;
}) {
  const [isPlayerOpen, setIsPlayerOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Card className="group bg-gray-900/50 border-gray-800 hover:border-red-500/50 transition-all duration-300 hover:bg-gray-800/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="text-center">
                <div className="text-xs text-gray-400">
                  S{seasonNumber.toString().padStart(2, "0")}
                </div>
                <div className="text-sm font-semibold text-white">
                  E{episode.episodeNumber.toString().padStart(2, "0")}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                  {episode.title}
                </h4>
                <div className="flex gap-2 ml-4">
                  <Badge
                    variant="secondary"
                    className="bg-green-600 text-white text-xs"
                  >
                    {episode.quality}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-gray-600 text-gray-300 text-xs"
                  >
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

              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {episode.overview}
              </p>

              <div className="flex gap-2">
                {episode.playPath &&
                  episode.transcodeStatus === TranscodeStatus.COMPLETED && (
                    <>
                      {isAuthenticated ? (
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => setIsPlayerOpen(true)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play
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
                    </>
                  )}
                {(episode.transcodeStatus === TranscodeStatus.IN_PROGRESS ||
                  episode.transcodeStatus === TranscodeStatus.PENDING) && (
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
        </CardContent>
      </Card>

      {/* HLS Player Dialog */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-6xl p-0 bg-black border-gray-800">
          <VisuallyHidden>
            <DialogTitle className="text-2xl font-bold text-white"></DialogTitle>
          </VisuallyHidden>
          <HLSPlayer
            src={new URL(
              process.env.NEXT_PUBLIC_API_URL + episode.playPath
            ).toString()}
            title={`S${seasonNumber
              .toString()
              .padStart(2, "0")}E${episode.episodeNumber
              .toString()
              .padStart(2, "0")} - ${episode.title}`}
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
