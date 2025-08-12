import { Request, Response, NextFunction } from 'express';
import { CacheInvalidationService } from './cache-invalidation';

/**
 * Interface for cache invalidation options
 */
export interface CacheInvalidationOptions {
  /**
   * Specific cache keys to invalidate
   */
  keys?: string[];
  
  /**
   * Cache key patterns to invalidate
   */
  patterns?: string[];
  
  /**
   * Resource type for automatic invalidation (e.g., 'movie', 'series', 'episode')
   */
  resourceType?: 'movie' | 'series' | 'episode' | 'transcode' | 'folder' | 'conflict' | 'progress' | 'scanner' | 'stream' | 'webhook';
  
  /**
   * Custom invalidation function
   */
  customInvalidation?: (req: Request, res: Response) => Promise<void>;
}

/**
 * Middleware to invalidate cache after successful data modifications
 * @param options Cache invalidation options
 */
export const invalidateCache = (options: CacheInvalidationOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store the original end method
    const originalEnd = res.end;
    
    // Override the end method to perform cache invalidation after response is sent
    // @ts-ignore - TypeScript doesn't like us overriding the end method, but it works
    res.end = function (chunk?: any, encoding?: any, callback?: any) {
      // Only invalidate cache for successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Execute cache invalidation asynchronously (don't block response)
        setTimeout(async () => {
          try {
            await performCacheInvalidation(req, res, options);
            console.log('Cache invalidation completed for:', req.originalUrl);
          } catch (error) {
            console.error('Error during cache invalidation:', error);
          }
        }, 0);
      }
      
      // Call the original end method
      return originalEnd.call(this, chunk, encoding, callback);
    };
    
    next();
  };
};

/**
 * Perform cache invalidation based on options and request context
 */
async function performCacheInvalidation(
  req: Request, 
  res: Response, 
  options: CacheInvalidationOptions
): Promise<void> {
  // Invalidate specific keys if provided
  if (options.keys && options.keys.length > 0) {
    for (const key of options.keys) {
      await CacheInvalidationService.clearKey(key);
    }
  }
  
  // Invalidate patterns if provided
  if (options.patterns && options.patterns.length > 0) {
    for (const pattern of options.patterns) {
      await CacheInvalidationService.clearPattern(pattern);
    }
  }
  
  // Handle resource-specific invalidation
  if (options.resourceType) {
    await invalidateByResourceType(req, options.resourceType);
  }
  
  // Execute custom invalidation if provided
  if (options.customInvalidation) {
    await options.customInvalidation(req, res);
  }
}

/**
 * Invalidate cache based on resource type and request parameters
 */
async function invalidateByResourceType(req: Request, resourceType: string): Promise<void> {
  const { params, body } = req;
  
  switch (resourceType) {
    case 'movie':
      if (params.id) {
        // Specific movie
        await CacheInvalidationService.clearMovieCache(params.id);
      } else {
        // All movies
        await CacheInvalidationService.clearMoviesCache();
      }
      break;
      
    case 'series':
      if (params.id || params.seriesId) {
        // Specific series
        const seriesId = params.id || params.seriesId;
        await CacheInvalidationService.clearSeriesCache(seriesId);
      } else {
        // All series
        await CacheInvalidationService.clearSeriesCache(undefined);
      }
      break;
      
    case 'episode':
      if (params.seriesId && params.seasonNumber) {
        // Specific episode or season
        await CacheInvalidationService.clearEpisodeCache(
          params.seriesId,
          parseInt(params.seasonNumber),
          params.episodeNumber ? parseInt(params.episodeNumber) : undefined
        );
      } else if (params.id) {
        // Episode by ID - need to clear series cache too
        await CacheInvalidationService.clearKey(`cache:/api/episodes/${params.id}`);
        await CacheInvalidationService.clearSeriesCache();
      }
      break;
      
    case 'transcode':
      if (req.path.includes('/movie/')) {
        // Movie transcode
        const movieId = params.id;
        await CacheInvalidationService.clearMovieTranscodeCache(movieId);
      } else if (req.path.includes('/episode/')) {
        // Episode transcode - this would need episode metadata from body or params
        const episodeId = params.id;
        
        // If we have the full episode context in the body
        if (body && body.seriesId && body.seasonNumber && body.episodeNumber) {
          await CacheInvalidationService.clearEpisodeTranscodeCache(
            episodeId,
            body.seriesId,
            body.seasonNumber,
            body.episodeNumber
          );
        } else {
          // Otherwise just clear all transcode caches
          await CacheInvalidationService.clearTranscodeCache();
        }
      } else if (params.status) {
        // Transcode status
        await CacheInvalidationService.clearTranscodeStatusCache(params.status);
      } else {
        // All transcode
        await CacheInvalidationService.clearTranscodeCache();
      }
      break;
      
    case 'folder':
      await CacheInvalidationService.clearMediaFoldersCache();
      break;
      
    case 'conflict':
      await CacheInvalidationService.clearConflictsCache();
      break;
      
    case 'progress':
      const { clerkId, tmdbId } = params;
      await CacheInvalidationService.clearProgressCache(clerkId, tmdbId);
      break;
      
    case 'stream':
      if (req.path.includes('/movies/')) {
        const movieId = params.id;
        // Clear movie streaming caches
        await CacheInvalidationService.clearPattern(`cache:/api/movies/${movieId}/hls*`);
      } else if (req.path.includes('/episodes/')) {
        const episodeId = params.id;
        // Clear episode streaming caches
        await CacheInvalidationService.clearPattern(`cache:/api/episodes/${episodeId}/hls*`);
      }
      break;
      
    case 'webhook':
      // For Clerk webhooks, we might need to invalidate user-related caches
      if (req.path.includes('/clerk')) {
        // Clear user progress caches as they might be affected by user changes
        await CacheInvalidationService.clearProgressCache();
      }
      break;
      
    case 'scanner':
      if (req.path.includes('/folders')) {
        if (params.id) {
          // Specific folder
          await CacheInvalidationService.clearMediaFoldersCache();
        } else {
          // All folders
          await CacheInvalidationService.clearMediaFoldersCache();
        }
      } else if (req.path.includes('/conflicts')) {
        if (params.id) {
          // Specific conflict
          await CacheInvalidationService.clearConflictsCache();
        } else {
          // All conflicts
          await CacheInvalidationService.clearConflictsCache();
        }
      } else if (req.path.includes('/scan')) {
        // After scanning, clear all relevant caches
        await CacheInvalidationService.clearMoviesCache();
        await CacheInvalidationService.clearSeriesCache(undefined);
        await CacheInvalidationService.clearMediaFoldersCache();
        await CacheInvalidationService.clearConflictsCache();
      }
      break;
      
    default:
      // For unknown resource types, invalidate based on the URL path
      await CacheInvalidationService.clearPattern(`cache:${req.baseUrl}*`);
  }
}

/**
 * Create a router with automatic cache invalidation for data-modifying routes
 * @param options Default cache invalidation options
 */
export function createCacheInvalidatingRouter(options: CacheInvalidationOptions = {}) {
  const express = require('express');
  const router = express.Router();
  
  // Store original methods
  const originalPost = router.post.bind(router);
  const originalPut = router.put.bind(router);
  const originalPatch = router.patch.bind(router);
  const originalDelete = router.delete.bind(router);
  
  // Override POST method to include cache invalidation
  router.post = function(path: string | RegExp | Array<string | RegExp>, ...handlers: any[]) {
    // Apply cache invalidation middleware before the route handlers
    return originalPost.call(this, path, invalidateCache(options), ...handlers);
  };
  
  // Override PUT method to include cache invalidation
  router.put = function(path: string | RegExp | Array<string | RegExp>, ...handlers: any[]) {
    // Apply cache invalidation middleware before the route handlers
    return originalPut.call(this, path, invalidateCache(options), ...handlers);
  };
  
  // Override PATCH method to include cache invalidation
  router.patch = function(path: string | RegExp | Array<string | RegExp>, ...handlers: any[]) {
    // Apply cache invalidation middleware before the route handlers
    return originalPatch.call(this, path, invalidateCache(options), ...handlers);
  };
  
  // Override DELETE method to include cache invalidation
  router.delete = function(path: string | RegExp | Array<string | RegExp>, ...handlers: any[]) {
    // Apply cache invalidation middleware before the route handlers
    return originalDelete.call(this, path, invalidateCache(options), ...handlers);
  };
  
  return router;
}

/**
 * Create a router with both caching for GET routes and cache invalidation for data-modifying routes
 */
export function createSmartCacheRouter(cacheOptions: any = {}, invalidationOptions: CacheInvalidationOptions = {}) {
  const { createCachedRouter } = require('./cache-routes');
  
  // First create a router with GET caching
  const router = createCachedRouter(cacheOptions);
  
  // Store original methods for data-modifying routes
  const originalPost = router.post.bind(router);
  const originalPut = router.put.bind(router);
  const originalPatch = router.patch.bind(router);
  const originalDelete = router.delete.bind(router);
  
  // Override POST method to include cache invalidation
  router.post = function(path: string | RegExp | Array<string | RegExp>, ...handlers: any[]) {
    // Apply cache invalidation middleware before the route handlers
    return originalPost.call(this, path, invalidateCache(invalidationOptions), ...handlers);
  };
  
  // Override PUT method to include cache invalidation
  router.put = function(path: string | RegExp | Array<string | RegExp>, ...handlers: any[]) {
    // Apply cache invalidation middleware before the route handlers
    return originalPut.call(this, path, invalidateCache(invalidationOptions), ...handlers);
  };
  
  // Override PATCH method to include cache invalidation
  router.patch = function(path: string | RegExp | Array<string | RegExp>, ...handlers: any[]) {
    // Apply cache invalidation middleware before the route handlers
    return originalPatch.call(this, path, invalidateCache(invalidationOptions), ...handlers);
  };
  
  // Override DELETE method to include cache invalidation
  router.delete = function(path: string | RegExp | Array<string | RegExp>, ...handlers: any[]) {
    // Apply cache invalidation middleware before the route handlers
    return originalDelete.call(this, path, invalidateCache(invalidationOptions), ...handlers);
  };
  
  return router;
}
