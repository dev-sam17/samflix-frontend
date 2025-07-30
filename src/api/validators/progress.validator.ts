import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// Schema for POST /api/progress
export const saveProgressSchema = z.object({
  clerkId: z.string().min(1, "ClerkId is required"),
  tmdbId: z.string().min(1, "TmdbId is required"),
  currentTime: z.number().min(0, "Current time must be a non-negative number"),
});

// Middleware to validate request body
export const validateSaveProgress = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    saveProgressSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error,
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Schema for params with clerkId and tmdbId
export const progressParamsSchema = z.object({
  clerkId: z.string().min(1, "ClerkId is required"),
  tmdbId: z.string().min(1, "TmdbId is required"),
});

// Middleware to validate request params for single progress entry
export const validateProgressParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    progressParamsSchema.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error,
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

// Schema for params with only clerkId
export const clerkIdParamSchema = z.object({
  clerkId: z.string().min(1, "ClerkId is required"),
});

// Middleware to validate request params for all progress entries
export const validateClerkIdParam = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    clerkIdParamSchema.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error,
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
