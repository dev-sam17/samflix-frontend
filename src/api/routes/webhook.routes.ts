import express from "express";
import { WebhookController } from "../controllers/webhook.controller";

const router = express.Router();
const webhookController = new WebhookController();

// Clerk webhook endpoint
// Using express.raw middleware with application/json type for Clerk webhook verification
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  webhookController.handleClerkWebhook
);

export default router;
