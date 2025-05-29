import path from 'path';
import { ParsedMovie, ParsedEpisode } from '../../types/media.types';

class ParserService {
  private readonly movieRegexPatterns = [
    // Pattern 1: Movie Name (Year) [Resolution] [Quality] [RIP] [Sound] [Provider]
    /^(.+?)\s*\((\d{4})\)\s*(?:\[(.*?)\])?\s*(?:\[(.*?)\])?\s*(?:\[(.*?)\])?\s*(?:\[(.*?)\])?\s*(?:\[(.*?)\])?/,
    // Pattern 2: Movie.Name.Year.Resolution.Quality.RIP.Sound.Provider
    /^(.+?)\.(\d{4})(?:\.(.*?))?(?:\.(.*?))?(?:\.(.*?))?(?:\.(.*?))?(?:\.(.*?))?$/
  ];

  private readonly episodeRegexPatterns = [
    // Common episode patterns
    /^(.+?)[\.\s][Ss](\d{1,2})[Ee](\d{1,2})/i,
    /^(.+?)[\.\s](\d{1,2})x(\d{1,2})/i
  ];

  parseMovie(filePath: string): ParsedMovie | null {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    for (const pattern of this.movieRegexPatterns) {
      const match = fileName.match(pattern);
      if (match) {
        const [
          ,
          title,
          year,
          resolution = '',
          quality = '',
          rip = '',
          sound = '',
          provider = ''
        ] = match;

        return {
          fileName,
          filePath,
          title: this.cleanTitle(title),
          year: parseInt(year),
          resolution: resolution || undefined,
          quality: quality || undefined,
          rip: rip || undefined,
          sound: sound || undefined,
          provider: provider || undefined
        };
      }
    }
    return null;
  }

  parseEpisode(filePath: string): ParsedEpisode | null {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    for (const pattern of this.episodeRegexPatterns) {
      const match = fileName.match(pattern);
      if (match) {
        const [, seriesName, seasonStr, episodeStr] = match;
        
        // Extract quality info if present
        const qualityMatch = fileName.match(/\[(.*?)\]/g);
        const [
          resolution = '',
          quality = '',
          rip = '',
          sound = '',
          provider = ''
        ] = qualityMatch || [];

        return {
          fileName,
          filePath,
          seriesName: this.cleanTitle(seriesName),
          seasonNumber: parseInt(seasonStr),
          episodeNumber: parseInt(episodeStr),
          resolution: resolution?.replace(/[\[\]]/g, '') || undefined,
          quality: quality?.replace(/[\[\]]/g, '') || undefined,
          rip: rip?.replace(/[\[\]]/g, '') || undefined,
          sound: sound?.replace(/[\[\]]/g, '') || undefined,
          provider: provider?.replace(/[\[\]]/g, '') || undefined
        };
      }
    }
    return null;
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/\./g, ' ')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const parserService = new ParserService();
