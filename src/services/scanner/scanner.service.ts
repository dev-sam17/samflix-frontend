import fs from 'fs';
import path from 'path';
import { prisma } from '../../app';
import { parserService } from '../parser/parser.service';
import { tmdbService } from '../tmdb/tmdb.service';
import { ScannerConfig, TMDBMovieResult, TMDBTVResult } from '../../types/media.types';

class ScannerService {
  private readonly supportedExtensions: string[] = ['.mp4', '.mkv', '.avi'];
  
  async scanAll(config: ScannerConfig) {
    try {
      for (const moviePath of config.moviePaths) {
        await this.scanMovieDirectory(moviePath);
      }
      
      for (const seriesPath of config.seriesPaths) {
        await this.scanSeriesDirectory(seriesPath);
      }
    } catch (error) {
      console.error('Error during media scan:', error);
      throw error;
    }
  }

  private async scanMovieDirectory(directoryPath: string) {
    const files = await this.getMediaFiles(directoryPath);
    
    for (const file of files) {
      try {
        const parsedMovie = parserService.parseMovie(file);
        if (!parsedMovie) continue;

        // Search TMDB
        const searchResults = await tmdbService.searchMovie(parsedMovie.title, parsedMovie.year);
        
        if (searchResults.length === 0) {
          await this.createScanningConflict('movie', parsedMovie.fileName, parsedMovie.filePath, []);
          continue;
        }

        if (searchResults.length > 1) {
          await this.createScanningConflict('movie', parsedMovie.fileName, parsedMovie.filePath, searchResults);
          continue;
        }

        const movieDetails = await tmdbService.getMovieDetails(searchResults[0].id);
        
        // Create or update movie in database
        await prisma.movie.upsert({
          where: { tmdbId: movieDetails.id },
          create: {
            tmdbId: movieDetails.id,
            title: movieDetails.title,
            year: new Date(movieDetails.release_date).getFullYear(),
            overview: movieDetails.overview,
            posterPath: movieDetails.poster_path,
            backdropPath: movieDetails.backdrop_path,
            genres: movieDetails.genres.map(g => g.name),
            runtime: movieDetails.runtime,
            rating: movieDetails.vote_average,
            filePath: parsedMovie.filePath,
            fileName: parsedMovie.fileName,
            resolution: parsedMovie.resolution,
            quality: parsedMovie.quality,
            rip: parsedMovie.rip,
            sound: parsedMovie.sound,
            provider: parsedMovie.provider
          },
          update: {
            filePath: parsedMovie.filePath,
            fileName: parsedMovie.fileName,
            resolution: parsedMovie.resolution,
            quality: parsedMovie.quality,
            rip: parsedMovie.rip,
            sound: parsedMovie.sound,
            provider: parsedMovie.provider
          }
        });
      } catch (error) {
        console.error(`Error processing movie file ${file}:`, error);
      }
    }
  }

  private async scanSeriesDirectory(directoryPath: string) {
    const files = await this.getMediaFiles(directoryPath);
    
    for (const file of files) {
      try {
        const parsedEpisode = parserService.parseEpisode(file);
        if (!parsedEpisode) continue;

        // Search TMDB
        const searchResults = await tmdbService.searchTV(parsedEpisode.seriesName);
        
        if (searchResults.length === 0) {
          await this.createScanningConflict('series', parsedEpisode.fileName, parsedEpisode.filePath, []);
          continue;
        }

        if (searchResults.length > 1) {
          await this.createScanningConflict('series', parsedEpisode.fileName, parsedEpisode.filePath, searchResults);
          continue;
        }

        const seriesDetails = await tmdbService.getTVDetails(searchResults[0].id);
        const episodeDetails = await tmdbService.getEpisodeDetails(
          searchResults[0].id,
          parsedEpisode.seasonNumber,
          parsedEpisode.episodeNumber
        );

        // Create or update series
        const series = await prisma.tvSeries.upsert({
          where: { tmdbId: seriesDetails.id },
          create: {
            tmdbId: seriesDetails.id,
            title: seriesDetails.name,
            overview: seriesDetails.overview,
            posterPath: seriesDetails.poster_path,
            backdropPath: seriesDetails.backdrop_path,
            genres: seriesDetails.genres.map(g => g.name),
            firstAirDate: new Date(seriesDetails.first_air_date),
            lastAirDate: new Date(seriesDetails.last_air_date),
            status: seriesDetails.status
          },
          update: {}
        });

        // Create or update episode
        const episodeData = {
          tmdbId: episodeDetails.id,
          title: episodeDetails.name,
          overview: episodeDetails.overview,
          filePath: parsedEpisode.filePath,
          fileName: parsedEpisode.fileName,
          resolution: parsedEpisode.resolution,
          quality: parsedEpisode.quality,
          rip: parsedEpisode.rip,
          sound: parsedEpisode.sound,
          provider: parsedEpisode.provider,
          seasonNumber: episodeDetails.season_number,
          episodeNumber: episodeDetails.episode_number,
          airDate: episodeDetails.air_date ? new Date(episodeDetails.air_date) : null,
          seriesId: series.id
        };

        // First try to find existing episode by the unique constraint
        const existingEpisode = await prisma.episode.findFirst({
          where: {
            tmdbId: episodeDetails.id,
            seasonNumber: episodeDetails.season_number,
            episodeNumber: episodeDetails.episode_number
          }
        });

        if (existingEpisode) {
          // Update existing episode
          await prisma.episode.update({
            where: { id: existingEpisode.id },
            data: {
              filePath: parsedEpisode.filePath,
              fileName: parsedEpisode.fileName,
              resolution: parsedEpisode.resolution,
              quality: parsedEpisode.quality,
              rip: parsedEpisode.rip,
              sound: parsedEpisode.sound,
              provider: parsedEpisode.provider
            }
          });
        } else {
          // Create new episode
          await prisma.episode.create({
            data: episodeData
          });
        }
      } catch (error) {
        console.error(`Error processing episode file ${file}:`, error);
      }
    }
  }

  private async getMediaFiles(directoryPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const items = await fs.promises.readdir(directoryPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(directoryPath, item.name);
      
      if (item.isDirectory()) {
        files.push(...await this.getMediaFiles(fullPath));
      } else if (
        item.isFile() && 
        this.supportedExtensions.includes(path.extname(item.name).toLowerCase())
      ) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private async createScanningConflict(mediaType: 'movie' | 'series', fileName: string, filePath: string, possibleMatches: (TMDBMovieResult | TMDBTVResult)[]) {
    // Convert matches to a plain object array for Prisma JSON compatibility
    const matchesForDb = possibleMatches.map(match => ({ ...match }));
    try {
      // First try to find if there's an existing conflict with the same filePath
      const existingConflict = await prisma.scanningConflict.findFirst({
        where: { filePath }
      });

      if (existingConflict) {
        // Update existing conflict
        await prisma.scanningConflict.update({
          where: { id: existingConflict.id },
          data: {
            possibleMatches: matchesForDb || [],
            resolved: false
          }
        });
      } else {
        // Create new conflict
        await prisma.scanningConflict.create({
          data: {
            fileName,
            filePath,
            mediaType,
            possibleMatches: matchesForDb || [],
            resolved: false
          }
        });
      }
    } catch (error) {
      console.error('Error creating/updating scanning conflict:', error);
      throw error;
    }
  }

  /**
   * Resolves a scanning conflict by adding the selected media to the database
   * @param conflictId The ID of the conflict to resolve
   * @param selectedId The TMDB ID of the selected media
   * @returns The updated conflict
   */
  async resolveConflict(conflictId: string, selectedId: number) {
    try {
      // Get the conflict details first
      const conflictDetails = await prisma.scanningConflict.findUnique({
        where: { id: conflictId }
      });

      if (!conflictDetails) {
        throw new Error('Conflict not found');
      }

      // Update the conflict as resolved
      const conflict = await prisma.scanningConflict.update({
        where: { id: conflictId },
        data: { 
          resolved: true,
          selectedId
        }
      });

      // Add the media to the database based on the conflict type
      if (conflictDetails.mediaType === 'movie') {
        // Get movie details from TMDB
        const movieDetails = await tmdbService.getMovieDetails(selectedId);
        
        // Parse the file to get quality information
        const parsedMovie = parserService.parseMovie(conflictDetails.filePath);
        
        if (parsedMovie && movieDetails) {
          // Add the movie to the database
          await prisma.movie.upsert({
            where: { tmdbId: movieDetails.id },
            create: {
              tmdbId: movieDetails.id,
              title: movieDetails.title,
              year: new Date(movieDetails.release_date).getFullYear(),
              overview: movieDetails.overview,
              posterPath: movieDetails.poster_path,
              backdropPath: movieDetails.backdrop_path,
              genres: movieDetails.genres.map(g => g.name),
              runtime: movieDetails.runtime,
              rating: movieDetails.vote_average,
              filePath: parsedMovie.filePath,
              fileName: parsedMovie.fileName,
              resolution: parsedMovie.resolution,
              quality: parsedMovie.quality,
              rip: parsedMovie.rip,
              sound: parsedMovie.sound,
              provider: parsedMovie.provider
            },
            update: {
              filePath: parsedMovie.filePath,
              fileName: parsedMovie.fileName,
              resolution: parsedMovie.resolution,
              quality: parsedMovie.quality,
              rip: parsedMovie.rip,
              sound: parsedMovie.sound,
              provider: parsedMovie.provider
            }
          });
        }
      } else if (conflictDetails.mediaType === 'series') {
        // Get series details from TMDB
        const seriesDetails = await tmdbService.getTVDetails(selectedId);
        
        // Parse the file to get episode information
        const parsedEpisode = parserService.parseEpisode(conflictDetails.filePath);
        
        if (parsedEpisode && seriesDetails) {
          // Get episode details
          const episodeDetails = await tmdbService.getEpisodeDetails(
            selectedId,
            parsedEpisode.seasonNumber,
            parsedEpisode.episodeNumber
          );
          
          // Add the series to the database
          const series = await prisma.tvSeries.upsert({
            where: { tmdbId: seriesDetails.id },
            create: {
              tmdbId: seriesDetails.id,
              title: seriesDetails.name,
              overview: seriesDetails.overview,
              posterPath: seriesDetails.poster_path,
              backdropPath: seriesDetails.backdrop_path,
              genres: seriesDetails.genres.map(g => g.name),
              firstAirDate: new Date(seriesDetails.first_air_date),
              lastAirDate: new Date(seriesDetails.last_air_date),
              status: seriesDetails.status
            },
            update: {}
          });
          
          // Add the episode to the database
          if (episodeDetails) {
            const episodeData = {
              tmdbId: episodeDetails.id,
              title: episodeDetails.name,
              overview: episodeDetails.overview,
              filePath: parsedEpisode.filePath,
              fileName: parsedEpisode.fileName,
              resolution: parsedEpisode.resolution,
              quality: parsedEpisode.quality,
              rip: parsedEpisode.rip,
              sound: parsedEpisode.sound,
              provider: parsedEpisode.provider,
              seasonNumber: episodeDetails.season_number,
              episodeNumber: episodeDetails.episode_number,
              airDate: episodeDetails.air_date ? new Date(episodeDetails.air_date) : null,
              seriesId: series.id
            };
            
            // Check if episode already exists
            const existingEpisode = await prisma.episode.findFirst({
              where: {
                tmdbId: episodeDetails.id,
                seasonNumber: episodeDetails.season_number,
                episodeNumber: episodeDetails.episode_number
              }
            });
            
            if (existingEpisode) {
              // Update existing episode
              await prisma.episode.update({
                where: { id: existingEpisode.id },
                data: {
                  filePath: parsedEpisode.filePath,
                  fileName: parsedEpisode.fileName,
                  resolution: parsedEpisode.resolution,
                  quality: parsedEpisode.quality,
                  rip: parsedEpisode.rip,
                  sound: parsedEpisode.sound,
                  provider: parsedEpisode.provider
                }
              });
            } else {
              // Create new episode
              await prisma.episode.create({
                data: episodeData
              });
            }
          }
        }
      }

      return conflict;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      throw error;
    }
  }
}

export const scannerService = new ScannerService();
