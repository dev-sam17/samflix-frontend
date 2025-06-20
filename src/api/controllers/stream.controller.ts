import { Request, Response } from "express";
import { prisma } from "../../app";
import fs from "fs";
import path from "path";
import { stat } from "fs/promises";

type AsyncRequestHandler = (req: Request, res: Response) => Promise<void>;

class StreamController {
  /**
   * Stream a movie using HLS
   * Serves the master playlist file for the movie
   */
  streamMovieHLS: AsyncRequestHandler = async (req, res) => {
    try {
      const { id } = req.params;

      const movie = await prisma.movie.findUnique({
        where: { id },
      });

      if (!movie) {
        res.status(404).json({ error: "Movie not found" });
        return;
      }

      if (!movie.playPath) {
        res
          .status(404)
          .json({ error: "HLS playlist not available for this movie" });
        return;
      }

      // Check if the file exists
      //   if (!fs.existsSync(movie.playPath)) {
      //     res.status(404).json({ error: "HLS playlist file not found" });
      //     return;
      //   }

      // Set appropriate headers for m3u8 file
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Access-Control-Allow-Origin", "*");

      // Stream the master playlist file
      fs.createReadStream(movie.playPath).pipe(res);
    } catch (error) {
      console.error("Error streaming movie HLS:", error);
      res.status(500).json({ error: "Failed to stream movie" });
    }
  };

  /**
   * Serve HLS segment files for a movie
   */
  serveMovieSegment: AsyncRequestHandler = async (req, res) => {
    try {
      const { id, filename } = req.params;

      const movie = await prisma.movie.findUnique({
        where: { id },
      });

      if (!movie) {
        res.status(404).json({ error: "Movie not found" });
        return;
      }

      if (!movie.playPath) {
        res
          .status(404)
          .json({ error: "HLS playlist not available for this movie" });
        return;
      }

      // Get the directory of the master playlist
      const playlistDir = path.dirname(movie.playPath);
      const segmentPath = path.join(playlistDir, filename);

      // Check if the segment file exists
      if (!fs.existsSync(segmentPath)) {
        res.status(404).json({ error: "Segment file not found" });
        return;
      }

      // Set appropriate headers based on file extension
      const ext = path.extname(filename).toLowerCase();
      if (ext === ".ts") {
        res.setHeader("Content-Type", "video/mp2t");
      } else if (ext === ".m3u8") {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      } else if (ext === ".key") {
        res.setHeader("Content-Type", "application/octet-stream");
      }

      res.setHeader("Access-Control-Allow-Origin", "*");

      // Stream the segment file
      fs.createReadStream(segmentPath).pipe(res);
    } catch (error) {
      console.error("Error serving movie segment:", error);
      res.status(500).json({ error: "Failed to serve segment" });
    }
  };

  /**
   * Stream an episode using HLS
   * Serves the master playlist file for the episode
   */
  streamEpisodeHLS: AsyncRequestHandler = async (req, res) => {
    try {
      const { id } = req.params;

      const episode = await prisma.episode.findUnique({
        where: { id },
      });

      if (!episode) {
        res.status(404).json({ error: "Episode not found" });
        return;
      }

      if (!episode.playPath) {
        res
          .status(404)
          .json({ error: "HLS playlist not available for this episode" });
        return;
      }

      // Check if the file exists
      if (!fs.existsSync(episode.playPath)) {
        res.status(404).json({ error: "HLS playlist file not found" });
        return;
      }

      // Set appropriate headers for m3u8 file
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Access-Control-Allow-Origin", "*");

      // Stream the master playlist file
      fs.createReadStream(episode.playPath).pipe(res);
    } catch (error) {
      console.error("Error streaming episode HLS:", error);
      res.status(500).json({ error: "Failed to stream episode" });
    }
  };

  /**
   * Serve HLS segment files for an episode
   */
  serveEpisodeSegment: AsyncRequestHandler = async (req, res) => {
    try {
      const { id, filename } = req.params;

      const episode = await prisma.episode.findUnique({
        where: { id },
      });

      if (!episode) {
        res.status(404).json({ error: "Episode not found" });
        return;
      }

      if (!episode.playPath) {
        res
          .status(404)
          .json({ error: "HLS playlist not available for this episode" });
        return;
      }

      // Get the directory of the master playlist
      const playlistDir = path.dirname(episode.playPath);
      const segmentPath = path.join(playlistDir, filename);

      // Check if the segment file exists
      if (!fs.existsSync(segmentPath)) {
        res.status(404).json({ error: "Segment file not found" });
        return;
      }

      // Set appropriate headers based on file extension
      const ext = path.extname(filename).toLowerCase();
      if (ext === ".ts") {
        res.setHeader("Content-Type", "video/mp2t");
      } else if (ext === ".m3u8") {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      } else if (ext === ".key") {
        res.setHeader("Content-Type", "application/octet-stream");
      }

      res.setHeader("Access-Control-Allow-Origin", "*");

      // Stream the segment file
      fs.createReadStream(segmentPath).pipe(res);
    } catch (error) {
      console.error("Error serving episode segment:", error);
      res.status(500).json({ error: "Failed to serve segment" });
    }
  };

  /**
   * Download a movie file
   * Supports partial content for range requests
   */
  downloadMovie: AsyncRequestHandler = async (req, res) => {
    try {
      const { id } = req.params;

      const movie = await prisma.movie.findUnique({
        where: { id },
      });

      if (!movie) {
        res.status(404).json({ error: "Movie not found" });
        return;
      }

      if (!movie.filePath) {
        res
          .status(404)
          .json({ error: "Movie file not available for download" });
        return;
      }

      // Check if the file exists
      if (!fs.existsSync(movie.filePath)) {
        res.status(404).json({ error: "Movie file not found" });
        return;
      }

      const filePath = movie.filePath;
      const fileName = movie.fileName || path.basename(filePath);

      // Get file stats
      const stats = await stat(filePath);
      const fileSize = stats.size;

      // Handle range requests
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        });

        file.pipe(res);
      } else {
        // Full download
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        });

        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error) {
      console.error("Error downloading movie:", error);
      res.status(500).json({ error: "Failed to download movie" });
    }
  };

  /**
   * Download an episode file
   * Supports partial content for range requests
   */
  downloadEpisode: AsyncRequestHandler = async (req, res) => {
    try {
      const { id } = req.params;

      const episode = await prisma.episode.findUnique({
        where: { id },
      });

      if (!episode) {
        res.status(404).json({ error: "Episode not found" });
        return;
      }

      if (!episode.filePath) {
        res
          .status(404)
          .json({ error: "Episode file not available for download" });
        return;
      }

      // Check if the file exists
      if (!fs.existsSync(episode.filePath)) {
        res.status(404).json({ error: "Episode file not found" });
        return;
      }

      const filePath = episode.filePath;
      const fileName = episode.fileName || path.basename(filePath);

      // Get file stats
      const stats = await stat(filePath);
      const fileSize = stats.size;

      // Handle range requests
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        });

        file.pipe(res);
      } else {
        // Full download
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        });

        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error) {
      console.error("Error downloading episode:", error);
      res.status(500).json({ error: "Failed to download episode" });
    }
  };
}

export const streamController = new StreamController();
