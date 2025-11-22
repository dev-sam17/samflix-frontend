"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Star, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { Movie, TvSeries, TranscodeStatus } from "@/lib/types";
import { cn, runtimeFormat } from "@/lib/utils";

interface GenreCarouselProps {
  genre: string;
  type: "movies" | "series";
  className?: string;
}

export function GenreCarousel({ genre, type, className }: GenreCarouselProps) {
  const [items, setItems] = useState<(Movie | TvSeries)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerPage = 6;
  const maxIndex = Math.max(0, items.length - itemsPerPage);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        let data: (Movie | TvSeries)[];
        if (type === "movies") {
          data = await api.server.movies.getByGenre(genre);
        } else {
          data = await api.server.series.getByGenre(genre);
        }

        // Filter to only show completed items
        const completedItems = data.filter(item => item.transcodeStatus === TranscodeStatus.COMPLETED);
        setItems(completedItems);
      } catch (err) {
        console.error(`Error fetching ${type} for genre ${genre}:`, err);
        setError(`Failed to load ${type} for ${genre}`);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [genre, type]);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + itemsPerPage, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  const isMovie = (item: Movie | TvSeries): item is Movie => {
    return "runtime" in item;
  };

  const getItemYear = (item: Movie | TvSeries): string => {
    if (isMovie(item)) {
      return item.releaseDate
        ? new Date(item.releaseDate).getFullYear().toString()
        : "N/A";
    } else {
      return item.firstAirDate
        ? new Date(item.firstAirDate).getFullYear().toString()
        : "N/A";
    }
  };

  const getItemLink = (item: Movie | TvSeries): string => {
    if (isMovie(item)) {
      return `/movies/${item.id}`;
    } else {
      return `/series/${item.id}`;
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {genre} {type === "movies" ? "Movies" : "TV Series"}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
              <div className="aspect-[2/3] bg-gray-700 rounded-t-lg" />
              <CardContent className="p-3">
                <div className="h-4 bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-700 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <h2 className="text-xl font-bold text-white">
          {genre} {type === "movies" ? "Movies" : "TV Series"}
        </h2>
        <div className="text-red-400 text-center py-8">{error}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <h2 className="text-xl font-bold text-white">
          {genre} {type === "movies" ? "Movies" : "TV Series"}
        </h2>
        <div className="text-gray-400 text-center py-8">
          No {type} found for {genre}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {genre} {type === "movies" ? "Movies" : "TV Series"}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="text-white hover:bg-white/10 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="text-white hover:bg-white/10 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{
            transform: `translateX(-${(currentIndex / itemsPerPage) * 100}%)`,
          }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={getItemLink(item)}
              className="flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-14px)] group"
            >
              <Card className="bg-gray-900/50 border-gray-800 hover:border-red-500/50 transition-all duration-300 group-hover:scale-105">
                <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
                  <Image
                    src={api.utils.getTmdbImageUrl(
                      item.posterPath || "",
                      "w500"
                    )}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.666vw"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Rating Badge */}
                  {isMovie(item) && item.rating && item.rating > 0 && (
                    <Badge className="absolute top-2 right-2 bg-black/70 text-yellow-400 border-yellow-400/50">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {item.rating.toFixed(1)}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-3 space-y-2">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {getItemYear(item)}
                    </div>

                    {isMovie(item) && item.runtime && (
                      <div className="flex items-center gap-1">
                        {runtimeFormat(item.runtime)}
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {item.genres && item.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.genres.slice(0, 2).map((g) => (
                        <Badge
                          key={g}
                          variant="secondary"
                          className="text-xs bg-gray-800 text-gray-300 hover:bg-gray-700"
                        >
                          {g}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Indicators */}
      {items.length > itemsPerPage && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(items.length / itemsPerPage) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerPage)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  Math.floor(currentIndex / itemsPerPage) === index
                    ? "bg-red-500"
                    : "bg-gray-600 hover:bg-gray-500"
                )}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
