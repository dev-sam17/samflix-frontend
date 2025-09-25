"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Clock, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api, clientApi } from "@/lib/api";
import { useApiUrl } from "@/contexts/api-url-context";
import { useUser } from "@clerk/nextjs";
import { type Movie } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type ProgressItem = {
  tmdbId: string;
  currentTime: number;
  updatedAt: string;
};

type ContinueWatchingItem = ProgressItem & {
  movie: Movie;
};

export function ContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isSignedIn } = useUser();
  const { apiBaseUrl } = useApiUrl();

  useEffect(() => {
    const fetchContinueWatching = async () => {
      if (!isSignedIn || !user || !apiBaseUrl) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch all progress items for the user
        const progressItems = await clientApi.progress.getAllProgress(
          apiBaseUrl,
          user.id
        );

        console.log({ progressItems });

        if (progressItems.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch movie details for each progress item
        const itemsWithDetails = await Promise.all(
          progressItems.map(async (item) => {
            try {
              const movie = await clientApi.movies.getById(
                item.tmdbId,
                apiBaseUrl
              );
              return { ...item, movie } as ContinueWatchingItem;
            } catch (error) {
              console.error(`Error fetching movie ${item.tmdbId}:`, error);
              return null;
            }
          })
        );

        // Filter out items without movie details and sort by updatedAt (most recent first)
        const validItems = itemsWithDetails
          .filter((item): item is ContinueWatchingItem => item !== null)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

        setItems(validItems);
      } catch (error) {
        console.error("Error fetching continue watching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContinueWatching();
  }, [isSignedIn, user, apiBaseUrl]);

  const handleDeleteProgress = async (tmdbId: string) => {
    if (!user || !apiBaseUrl) return;

    try {
      await clientApi.progress.deleteProgress(apiBaseUrl, user.id, tmdbId);

      // Remove the item from the local state
      setItems((prevItems) =>
        prevItems.filter((item) => item.tmdbId !== tmdbId)
      );

      toast.success("Progress deleted successfully");
    } catch (error) {
      console.error("Error deleting progress:", error);
      toast.error("Failed to delete progress");
    }
  };

  // Don't render anything if user is not signed in or there are no items
  if ((!isSignedIn || items.length === 0) && !isLoading) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Continue Watching</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-4" />
              <div className="h-4 bg-gray-800 rounded mb-2" />
              <div className="h-3 bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {items.map((item) => (
            <ContinueWatchingCard
              key={item.tmdbId}
              item={item}
              onDelete={() => handleDeleteProgress(item.tmdbId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ContinueWatchingCard({
  item,
  onDelete,
}: {
  item: ContinueWatchingItem;
  onDelete: () => void;
}) {
  const movie = item.movie;
  const runtime = movie.runtime || 120; // Default to 120 minutes if runtime is undefined
  const progressPercent = Math.min(
    Math.round((item.currentTime / (runtime * 60)) * 100),
    100
  );

  // Format time as hours and minutes
  const formatTime = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="relative group">
      <Link href={`/movies/${movie.id}`}>
        <Card className="overflow-hidden bg-gray-900 border-gray-800 transition-all hover:scale-105 hover:border-gray-700">
          <div className="relative aspect-[2/3]">
            <Image
              src={api.utils.getTmdbImageUrl(movie.posterPath || "", "w500")}
              alt={movie.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <div
                className="h-full bg-red-600"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 rounded-full w-8 h-8 p-0"
                >
                  <Play className="w-4 h-4" />
                </Button>
                <div className="text-xs text-gray-300 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(item.currentTime)}
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-3">
            <h3 className="font-medium text-sm truncate">{movie.title}</h3>
            <p className="text-xs text-gray-400">
              {Math.round(progressPercent)}% watched
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* Three dots dropdown menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MoreHorizontal className="h-4 w-4 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-gray-900 border-gray-700"
          >
            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="text-red-400 hover:text-red-300 hover:bg-gray-800 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
