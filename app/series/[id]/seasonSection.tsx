"use client"

import React from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Season } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Play, Download, Calendar, Clock, ChevronDown, ChevronRight } from "lucide-react"

export default function SeasonSection({ season }: { season: Season }) {
    const [isOpen, setIsOpen] = React.useState(false)
  
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