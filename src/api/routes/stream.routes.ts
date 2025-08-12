import { createSmartCacheRouter } from '../middleware/cache-invalidation-middleware';
import { streamController } from "../controllers/stream.controller";

// Create a router with caching for GET routes and automatic cache invalidation for POST/PUT/DELETE routes
const router = createSmartCacheRouter(
  // Cache options for GET routes - short TTL for streaming content
  { ttl: 300 }, // 5 minutes cache
  // Invalidation options for data-modifying routes
  { resourceType: 'stream' }
);

// HLS streaming endpoints
router.get("/movies/:id/hls", streamController.streamMovieHLS);
router.get("/movies/:id/hls/:filename", streamController.serveMovieSegment);

router.get("/episodes/:id/hls", streamController.streamEpisodeHLS);
router.get("/episodes/:id/hls/:filename", streamController.serveEpisodeSegment);

// Download endpoints
router.get("/movies/:id/download", streamController.downloadMovie);
router.get("/episodes/:id/download", streamController.downloadEpisode);

export default router;
