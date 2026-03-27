import express from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import {
  handleGetPreferences,
  handleUpdateDashboardPreferences,
  handleUpdateNotificationPreferences,
  handleUpdatePreferences,
} from "../controllers/preferences.controller";

const router = express.Router();
router.use(clerkMiddleware());
router.use(requireAuth());

router.get("/preferences", handleGetPreferences);
router.patch("/preferences", handleUpdatePreferences);

router.patch("/preferences/dashboard", handleUpdateDashboardPreferences);
router.patch(
  "/preferences/notifications",
  handleUpdateNotificationPreferences
);

export default router;

