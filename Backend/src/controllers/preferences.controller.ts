import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
  getUserPreferences,
  updateDashboardPreferences,
  updateNotificationPreferences,
  updateUserPreferences,
} from "../services/tasks.service";

export const handleGetPreferences = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const preferences = await getUserPreferences(clerkUserId);
    res.json({ success: true, preferences });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const handleUpdatePreferences = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const updates = req.body ?? {};
    const preferences = await updateUserPreferences(clerkUserId, updates);
    res.json({ success: true, preferences });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const handleUpdateDashboardPreferences = async (
  req: Request,
  res: Response
) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const dashboardPrefs = req.body ?? {};
    const preferences = await updateDashboardPreferences(
      clerkUserId,
      dashboardPrefs
    );
    res.json({ success: true, preferences });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const handleUpdateNotificationPreferences = async (
  req: Request,
  res: Response
) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const notificationPrefs = req.body ?? {};
    const preferences = await updateNotificationPreferences(
      clerkUserId,
      notificationPrefs
    );
    res.json({ success: true, preferences });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

