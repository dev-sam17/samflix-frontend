import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { transcodeController } from "../controllers/transcode.controller";

type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;

const router = Router();

/**
 * @route PUT /api/transcode/movie/:id
 * @description Update the transcode status of a movie
 * @access Admin only
 */
router.put(
  "/movie/:id",
  transcodeController.updateMovieTranscodeStatus as unknown as RequestHandler
);

/**
 * @route PUT /api/transcode/episode/:id
 * @description Update the transcode status of an episode
 * @access Admin only
 */
router.put(
  "/episode/:id",
  transcodeController.updateEpisodeTranscodeStatus as unknown as RequestHandler
);

/**
 * @route GET /api/transcode/status/:status
 * @description Get all items with a specific transcode status
 * @access Admin only
 */
router.get(
  "/status/:status",
  transcodeController.getItemsByTranscodeStatus as unknown as RequestHandler
);

/**
 * @route GET /api/transcode/movies/status/:status
 * @description Get movies with a specific transcode status
 * @access Admin only
 */
router.get(
  "/movies/status/:status",
  transcodeController.getMoviesByTranscodeStatus as unknown as RequestHandler
);

/**
 * @route GET /api/transcode/episodes/status/:status
 * @description Get episodes with a specific transcode status
 * @access Admin only
 */
router.get(
  "/episodes/status/:status",
  transcodeController.getEpisodesByTranscodeStatus as unknown as RequestHandler
);

export default router;
