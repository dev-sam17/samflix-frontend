import { Router, Request, Response, NextFunction } from 'express';
import { seriesController } from '../controllers/series.controller';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

const router = Router();

// Series routes
router.get('/', (req, res, next) => (seriesController.getAllSeries as AsyncRequestHandler)(req, res, next));
router.get('/:id', (req, res, next) => (seriesController.getSeriesById as AsyncRequestHandler)(req, res, next));
router.get('/search/:query', (req, res, next) => (seriesController.searchSeries as AsyncRequestHandler)(req, res, next));
router.get('/:seriesId/season/:seasonNumber', (req, res, next) => (seriesController.getEpisodesBySeason as AsyncRequestHandler)(req, res, next));
router.get('/genre/:genre', (req, res, next) => (seriesController.getSeriesByGenre as AsyncRequestHandler)(req, res, next));
router.get('/:seriesId/season/:seasonNumber/episode/:episodeNumber', (req, res, next) => (seriesController.getEpisode as AsyncRequestHandler)(req, res, next));
router.get('/genres/all', (req, res, next) => (seriesController.getAllGenres as AsyncRequestHandler)(req, res, next));

export default router;
