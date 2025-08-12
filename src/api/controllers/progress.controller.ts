import { Request, Response } from "express";
import redisClient, { RESUME_PROGRESS_TTL } from "../../services/redis.service";
import { cacheInvalidation } from "../middleware/cache-invalidation";

/**
 * Progress controller for managing video resume playback
 */
export const progressController = {
  /**
   * Save or update progress for a specific user and video
   * @route POST /api/progress
   */
  saveProgress: async (req: Request, res: Response): Promise<void> => {
    try {
      const { clerkId, tmdbId, currentTime } = req.body;

      // Validate required fields
      if (!clerkId || !tmdbId || currentTime === undefined) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Create Redis key
      const key = `resume:${clerkId}:${tmdbId}`;

      // Create value object with current timestamp
      const value = JSON.stringify({
        currentTime,
        updatedAt: new Date().toISOString(),
      });

      // Save to Redis with TTL
      await redisClient.set(key, value, "EX", RESUME_PROGRESS_TTL);

      res.status(204).send();
    } catch (error) {
      console.error("Error saving progress:", error);
      res.status(500).json({ error: "Failed to save progress" });
    }
  },

  /**
   * Get progress for a specific user and video
   * @route GET /api/progress/:clerkId/:tmdbId
   */
  getProgress: async (req: Request, res: Response): Promise<void> => {
    try {
      const { clerkId, tmdbId } = req.params;

      // Create Redis key
      const key = `resume:${clerkId}:${tmdbId}`;

      // Get from Redis
      const result = await redisClient.get(key);

      if (!result) {
        res.status(404).json({ error: "Progress not found" });
        return;
      }

      // Parse the JSON string
      const progress = JSON.parse(result);

      res.status(200).json(progress);
    } catch (error) {
      console.error("Error getting progress:", error);
      res.status(500).json({ error: "Failed to get progress" });
    }
  },

  /**
   * Get all progress entries for a specific user
   * @route GET /api/progress/:clerkId
   */
  getAllProgress: async (req: Request, res: Response): Promise<void> => {
    try {
      const { clerkId } = req.params;

      // Create Redis key pattern for scanning
      const pattern = `resume:${clerkId}:*`;

      // Use Redis SCAN to get all matching keys
      const keys: string[] = [];
      let cursor = "0";

      do {
        // Use scan to get keys in batches
        const result: [string, string[]] = await redisClient.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          "100"
        );

        cursor = result[0];
        keys.push(...result[1]);
      } while (cursor !== "0");

      if (keys.length === 0) {
        res.status(200).json([]);
        return;
      }

      // Get all values for the found keys
      const values = await Promise.all(
        keys.map(async (key) => {
          const value = await redisClient.get(key);
          if (!value) return null;

          // Extract tmdbId from the key
          const tmdbId = key.split(":")[2];

          // Parse the stored JSON
          const progress = JSON.parse(value);

          return {
            tmdbId,
            ...progress,
          };
        })
      );

      // Filter out any null values (in case a key was deleted between scan and get)
      const validValues = values.filter(Boolean);

      res.status(200).json(validValues);
    } catch (error) {
      console.error("Error getting all progress:", error);
      res.status(500).json({ error: "Failed to get all progress" });
    }
  },

  /**
   * Delete progress for a specific user and video
   * @route DELETE /api/progress/:clerkId/:tmdbId
   */
  deleteProgress: async (req: Request, res: Response): Promise<void> => {
    try {
      const { clerkId, tmdbId } = req.params;

      // Create Redis key
      const key = `resume:${clerkId}:${tmdbId}`;

      // Delete from Redis
      const result = await redisClient.del(key);

      if (result === 0) {
        res.status(404).json({ error: "Progress not found" });
        return;
      }

      cacheInvalidation.clearProgressCache(clerkId, tmdbId);

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting progress:", error);
      res.status(500).json({ error: "Failed to delete progress" });
    }
  },
};
