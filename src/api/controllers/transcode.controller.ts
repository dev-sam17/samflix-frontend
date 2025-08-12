import { Request, Response } from "express";
import { transcodeService } from "../../services/transcode/transcode.service";
import type { TranscodeStatusType } from "../../types/media.types";
import { cacheInvalidation } from "../middleware/cache-invalidation";

type AsyncRequestHandler = (
  req: Request,
  res: Response
) => Promise<void | Response>;

class TranscodeController {
  /**
   * Update the transcode status of a movie
   */
  updateMovieTranscodeStatus: AsyncRequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || !status) {
        res.status(400).json({
          error: "Missing required parameters: id and status are required",
        });
        return;
      }

      const updatedMovie = await transcodeService.updateMovieTranscodeStatus(
        id,
        status as TranscodeStatusType
      );

      cacheInvalidation.clearPattern("cache:api:movies:*");

      res.json({
        success: true,
        message: "Movie transcode status updated successfully",
        data: updatedMovie,
      });
    } catch (error) {
      console.error("Error updating movie transcode status:", error);
      res.status(500).json({
        error: "Failed to update movie transcode status",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Update the transcode status of an episode
   */
  updateEpisodeTranscodeStatus: AsyncRequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || !status) {
        res.status(400).json({
          error: "Missing required parameters: id and status are required",
        });
        return;
      }
      const updatedEpisode =
        await transcodeService.updateEpisodeTranscodeStatus(
          id,
          status as TranscodeStatusType
        );

      cacheInvalidation.clearPattern("cache:api:episodes:*");

      res.json({
        success: true,
        message: "Episode transcode status updated successfully",
        data: updatedEpisode,
      });
    } catch (error) {
      console.error("Error updating episode transcode status:", error);
      res.status(500).json({
        error: "Failed to update episode transcode status",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Get all items with a specific transcode status
   */
  getItemsByTranscodeStatus: AsyncRequestHandler = async (req, res) => {
    try {
      const { status } = req.params;

      if (!status) {
        res.status(400).json({
          error: "Missing required parameter: status is required",
        });
        return;
      }

      const items = await transcodeService.getItemsByTranscodeStatus(
        status as TranscodeStatusType
      );

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      console.error("Error getting items by transcode status:", error);
      res.status(500).json({
        error: "Failed to get items by transcode status",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Get movies with a specific transcode status
   */
  getMoviesByTranscodeStatus: AsyncRequestHandler = async (req, res) => {
    try {
      const { status } = req.params;

      if (!status) {
        res.status(400).json({
          error: "Missing required parameter: status is required",
        });
        return;
      }

      const movies = await transcodeService.getMoviesByTranscodeStatus(
        status as TranscodeStatusType
      );

      res.json({
        success: true,
        data: movies,
      });
    } catch (error) {
      console.error("Error getting movies by transcode status:", error);
      res.status(500).json({
        error: "Failed to get movies by transcode status",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Get episodes with a specific transcode status
   */
  getEpisodesByTranscodeStatus: AsyncRequestHandler = async (req, res) => {
    try {
      const { status } = req.params;

      if (!status) {
        res.status(400).json({
          error: "Missing required parameter: status is required",
        });
        return;
      }

      const episodes = await transcodeService.getEpisodesByTranscodeStatus(
        status as TranscodeStatusType
      );

      res.json({
        success: true,
        data: episodes,
      });
    } catch (error) {
      console.error("Error getting episodes by transcode status:", error);
      res.status(500).json({
        error: "Failed to get episodes by transcode status",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

const transcodeController = new TranscodeController();

export { transcodeController };
