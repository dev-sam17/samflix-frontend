"use client";

import React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Season } from "@/lib/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { EpisodeCard } from "./EpisodeCard";

export default function SeasonSection({ season }: { season: Season }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-600 transition-all duration-300 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="font-semibold text-white">
                    S{season.seasonNumber}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Season {season.seasonNumber}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {season.episodes.length} episodes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
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
          <EpisodeCard
            key={episode.episodeNumber}
            episode={episode}
            seasonNumber={season.seasonNumber}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
