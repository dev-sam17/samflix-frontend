"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Star, Calendar, Clock, Film, Tv } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { Movie, TvSeries } from "@/lib/types";
import { cn, runtimeFormat } from "@/lib/utils";

interface FeaturedCarouselProps {
  items: (Movie | TvSeries)[];
  title: string;
  type: "movies" | "series";
  viewAllLink: string;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export function FeaturedCarousel({ 
  items, 
  title, 
  type, 
  viewAllLink, 
  loading = false, 
  error = null,
  className 
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 6; // Show 6 items at a time on desktop
  const maxIndex = Math.max(0, items.length - itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const isMovie = (item: Movie | TvSeries): item is Movie => {
    return 'runtime' in item;
  };

  const getItemYear = (item: Movie | TvSeries): string => {
    if (isMovie(item)) {
      return item.releaseDate ? new Date(item.releaseDate).getFullYear().toString() : "N/A";
    } else {
      return item.firstAirDate ? new Date(item.firstAirDate).getFullYear().toString() : "N/A";
    }
  };

  const getItemLink = (item: Movie | TvSeries): string => {
    return `/${type}/${item.id}`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-3" />
              <div className="h-4 bg-gray-800 rounded mb-2" />
              <div className="h-3 bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="text-red-400 text-center py-8">
          {error}
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="text-gray-400 text-center py-8">
          No {type} available
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          {/* Navigation arrows */}
          {items.length > itemsPerPage && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="border-gray-600 text-gray-300 hover:bg-white/10 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                className="border-gray-600 text-gray-300 hover:bg-white/10 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
          <Link href={viewAllLink}>
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-white/10"
            >
              View All
            </Button>
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{ transform: `translateX(-${(currentIndex / itemsPerPage) * 100}%)` }}
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
                    src={api.utils.getTmdbImageUrl(item.posterPath || "", "w500")}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.666vw"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Type Badge */}
                  <Badge className="absolute top-2 left-2 bg-black/70 text-white border-gray-600">
                    {type === "movies" ? (
                      <>
                        <Film className="w-3 h-3 mr-1" />
                        Movie
                      </>
                    ) : (
                      <>
                        <Tv className="w-3 h-3 mr-1" />
                        Series
                      </>
                    )}
                  </Badge>

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
                        <Clock className="w-3 h-3" />
                        {runtimeFormat(item.runtime)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {item.genres.slice(0, 2).map((genre: string) => (
                      <Badge
                        key={genre}
                        variant="outline"
                        className="text-xs border-gray-600 text-gray-300 px-1 py-0"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Indicators */}
      {items.length > itemsPerPage && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(items.length / itemsPerPage) }).map((_, index) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
