"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GenreCarousel } from "@/components/genre-carousel";
import { Film, Tv, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function GenresPage() {
  const [movieGenres, setMovieGenres] = useState<string[]>([]);
  const [seriesGenres, setSeriesGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("movies");

  // Helper function to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        setError(null);

        const [movieGenresData, seriesGenresData] = await Promise.all([
          api.server.movies.getAllGenres(),
          api.server.series.getAllGenres(),
        ]);

        // Shuffle genres to display in random order
        setMovieGenres(shuffleArray(movieGenresData));
        setSeriesGenres(shuffleArray(seriesGenresData));
      } catch (err) {
        console.error("Error fetching genres:", err);
        setError("Failed to load genres. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto" />
              <p className="text-white text-lg">Loading genres...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-white text-lg">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Browse by Genre</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover movies and TV series organized by genres. Explore curated
            collections displayed in random order for a fresh browsing
            experience.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-800">
            <TabsTrigger
              value="movies"
              className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <Film className="w-4 h-4" />
              Movies
            </TabsTrigger>
            <TabsTrigger
              value="series"
              className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <Tv className="w-4 h-4" />
              TV Series
            </TabsTrigger>
          </TabsList>

          {/* Movies Tab */}
          <TabsContent value="movies" className="space-y-8">
            {/* Movie Carousels */}
            <div className="space-y-8">
              {movieGenres.map((genre) => (
                <GenreCarousel
                  key={`movie-${genre}`}
                  genre={genre}
                  type="movies"
                  className="animate-in fade-in-50 duration-500"
                />
              ))}
            </div>
          </TabsContent>

          {/* TV Series Tab */}
          <TabsContent value="series" className="space-y-8">
            {/* Series Carousels */}
            <div className="space-y-8">
              {seriesGenres.map((genre) => (
                <GenreCarousel
                  key={`series-${genre}`}
                  genre={genre}
                  type="series"
                  className="animate-in fade-in-50 duration-500"
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Statistics */}
        <Card className="bg-gray-900/30 border-gray-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {movieGenres.length}
                </h3>
                <p className="text-gray-400">Movie Genres</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {seriesGenres.length}
                </h3>
                <p className="text-gray-400">TV Series Genres</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
