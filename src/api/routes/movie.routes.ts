import { Router, Request, Response, NextFunction } from 'express';
import { movieController } from '../controllers/movie.controller';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

const router = Router();

// Movie routes
router.get('/', (req, res, next) => (movieController.getAllMovies as AsyncRequestHandler)(req, res, next));
router.get('/:id', (req, res, next) => (movieController.getMovieById as AsyncRequestHandler)(req, res, next));
router.get('/search/:query', (req, res, next) => (movieController.searchMovies as AsyncRequestHandler)(req, res, next));
router.get('/genre/:genre', (req, res, next) => (movieController.getMoviesByGenre as AsyncRequestHandler)(req, res, next));
router.get('/genres/all', (req, res, next) => (movieController.getAllGenres as AsyncRequestHandler)(req, res, next));

export default router;
