import { prisma } from "../../app";
import type { TranscodeStatusType } from "../../types/media.types";

class TranscodeService {
  /**
   * Update the transcode status of a movie
   * @param id The movie ID
   * @param status The new transcode status
   * @returns The updated movie
   */
  async updateMovieTranscodeStatus(id: string, status: TranscodeStatusType) {
    try {
      const movie = await prisma.movie.findUnique({
        where: { id },
      });

      if (!movie) {
        throw new Error(`Movie with ID ${id} not found`);
      }

      return await prisma.movie.update({
        where: { id },
        data: { transcodeStatus: status },
      });
    } catch (error) {
      console.error("Error updating movie transcode status:", error);
      throw error;
    }
  }

  /**
   * Update the transcode status of an episode
   * @param id The episode ID
   * @param status The new transcode status
   * @returns The updated episode
   */
  async updateEpisodeTranscodeStatus(id: string, status: TranscodeStatusType) {
    try {
      const episode = await prisma.episode.findUnique({
        where: { id },
      });

      if (!episode) {
        throw new Error(`Episode with ID ${id} not found`);
      }

      return await prisma.episode.update({
        where: { id },
        data: { transcodeStatus: status },
      });
    } catch (error) {
      console.error("Error updating episode transcode status:", error);
      throw error;
    }
  }

  /**
   * Update the transcode status of all episodes in a series
   * @param seriesId The series ID
   * @param status The new transcode status
   * @returns Array of updated episodes
   */
  async updateSeriesTranscodeStatus(
    seriesId: string,
    status: TranscodeStatusType
  ) {
    try {
      // First, verify the series exists
      const series = await prisma.tvSeries.findUnique({
        where: { id: seriesId },
        include: {
          episodes: {
            select: { id: true, title: true, transcodeStatus: true },
          },
        },
      });

      if (!series) {
        throw new Error(`Series with ID ${seriesId} not found`);
      }

      if (series.episodes.length === 0) {
        throw new Error(`No episodes found for series with ID ${seriesId}`);
      }

      // Update all episodes in the series
      const updatedEpisodes = await prisma.episode.updateMany({
        where: { seriesId },
        data: { transcodeStatus: status },
      });

      // Return the updated episodes with full details
      const episodes = await prisma.episode.findMany({
        where: { seriesId },
        include: {
          series: {
            select: { id: true, title: true },
          },
        },
      });

      console.log(
        `Updated transcode status to ${status} for ${updatedEpisodes.count} episodes in series: ${series.title}`
      );

      return episodes;
    } catch (error) {
      console.error("Error updating series transcode status:", error);
      throw error;
    }
  }

  /**
   * Get all items with a specific transcode status
   * @param status The transcode status to filter by
   * @returns Object containing movies and episodes with the specified status
   */
  async getItemsByTranscodeStatus(status: TranscodeStatusType) {
    try {
      const movies = await prisma.movie.findMany({
        where: { transcodeStatus: status },
      });

      const episodes = await prisma.episode.findMany({
        where: { transcodeStatus: status },
        include: { series: true },
      });

      return { movies, episodes };
    } catch (error) {
      console.error("Error getting items by transcode status:", error);
      throw error;
    }
  }

  /**
   * Get movies with a specific transcode status
   * @param status The transcode status to filter by
   * @returns Array of movies with the specified status
   */
  async getMoviesByTranscodeStatus(status: TranscodeStatusType) {
    try {
      const movies = await prisma.movie.findMany({
        where: { transcodeStatus: status },
      });

      return movies;
    } catch (error) {
      console.error("Error getting movies by transcode status:", error);
      throw error;
    }
  }

  /**
   * Get episodes with a specific transcode status
   * @param status The transcode status to filter by
   * @returns Array of episodes with the specified status
   */
  async getEpisodesByTranscodeStatus(status: TranscodeStatusType) {
    try {
      const episodes = await prisma.episode.findMany({
        where: { transcodeStatus: status },
      });

      return episodes;
    } catch (error) {
      console.error("Error getting episodes by transcode status:", error);
      throw error;
    }
  }
}

export const transcodeService = new TranscodeService();
