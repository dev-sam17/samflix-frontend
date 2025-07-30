import express from "express";
import { progressController } from "../controllers/progress.controller";
import {
  validateSaveProgress,
  validateProgressParams,
  validateClerkIdParam,
} from "../validators/progress.validator";

const router = express.Router();

/**
 * @route POST /api/progress
 * @desc Save or update progress for a specific user and video
 * @body { clerkId: string, tmdbId: string, currentTime: number }
 * @returns 204 No Content
 */
router.post('/', validateSaveProgress, progressController.saveProgress);

/**
 * @route GET /api/progress/:clerkId/:tmdbId
 * @desc Get progress for a specific user and video
 * @returns { currentTime: number, updatedAt: string }
 */
router.get('/:clerkId/:tmdbId', validateProgressParams, progressController.getProgress);

/**
 * @route GET /api/progress/:clerkId
 * @desc Get all progress entries for a specific user
 * @returns Array of { tmdbId: string, currentTime: number, updatedAt: string }
 */
router.get('/:clerkId', validateClerkIdParam, progressController.getAllProgress);

/**
 * @route DELETE /api/progress/:clerkId/:tmdbId
 * @desc Delete progress for a specific user and video
 * @returns 204 No Content
 */
router.delete('/:clerkId/:tmdbId', validateProgressParams, progressController.deleteProgress);

export default router;
