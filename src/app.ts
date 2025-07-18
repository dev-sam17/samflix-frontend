import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { PrismaClient } from "@dev-sam17/prisma-client-for-samflix";
import morgan from "morgan";
dotenv.config({ path: ".env" });

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

// Import routes (to be created)
import movieRoutes from "./api/routes/movie.routes";
import seriesRoutes from "./api/routes/series.routes";
import scannerRoutes from "./api/routes/scanner.routes";
import streamRoutes from "./api/routes/stream.routes";
import webhookRoutes from "./api/routes/webhook.routes";

// Create Express app
const app = express();

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(cors({ origin: "*" }));

// Request logger
app.use(morgan("dev"));

// Routes that need raw body (must come before express.json() middleware)
app.use("/api/webhooks", webhookRoutes);

// Apply JSON parsing middleware AFTER the webhook routes
app.use(express.json());

// Other routes that can use parsed JSON body
app.use("/api/movies", movieRoutes);
app.use("/api/series", seriesRoutes);
app.use("/api/scanner", scannerRoutes);
app.use("/api/stream", streamRoutes);

// Serve media folder as static content
// In Docker container, media folder is one level up from the project root
app.use(
  "/media",
  express.static("/media", {
    setHeaders: (res, path) => {
      // Set CORS headers for all static media files
      res.setHeader("Access-Control-Allow-Origin", "*");

      // Set appropriate content type headers based on file extension
      if (path.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      } else if (path.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
      }
    },
  })
);

// Health check endpoint
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    err: Error,
    _: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);
// Start server
const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize cron job for scanning
const scanInterval = process.env.SCAN_INTERVAL || "0 * * * *";
cron.schedule(scanInterval, () => {
  // Scanner service will be implemented here
  console.log("Running scheduled media scan...");
});
