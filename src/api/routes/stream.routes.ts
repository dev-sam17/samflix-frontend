import { Router } from "express";
import { streamController } from "../controllers/stream.controller";

const router = Router();

// HLS streaming endpoints
router.get("/movies/:id/hls", streamController.streamMovieHLS);
router.get("/movies/:id/hls/:filename", streamController.serveMovieSegment);

router.get("/episodes/:id/hls", streamController.streamEpisodeHLS);
router.get("/episodes/:id/hls/:filename", streamController.serveEpisodeSegment);

// Download endpoints
router.get("/movies/:id/download", streamController.downloadMovie);
router.get("/episodes/:id/download", streamController.downloadEpisode);

export default router;
