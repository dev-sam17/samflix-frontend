import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { PrismaClient } from "@dev-sam17/prisma-client-for-samflix";
import morgan from "morgan";
dotenv.config({ path: ".env" });

// Import routes (to be created)
import movieRoutes from "./api/routes/movie.routes";
import seriesRoutes from "./api/routes/series.routes";
import scannerRoutes from "./api/routes/scanner.routes";

// Create Express app
const app = express();

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use(morgan("dev"));

// Routes
app.use("/api/movies", movieRoutes);
app.use("/api/series", seriesRoutes);
app.use("/api/scanner", scannerRoutes);

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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize cron job for scanning
const scanInterval = process.env.SCAN_INTERVAL || "0 * * * *";
cron.schedule(scanInterval, () => {
  // Scanner service will be implemented here
  console.log("Running scheduled media scan...");
});
