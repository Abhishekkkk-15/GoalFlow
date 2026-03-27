import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
  getMonthlyTasks,
  getTasksForDateRange,
  getTodayTasks,
  getWeeklyTasks,
  completeTask,
  getTaskAnalytics,
  getUserAnalytics,
} from "../services/tasks.service";

export const handleGetTasksToday = async (req: Request, res: Response) => {
  try {
    const planId = req.params.planId;
    if (!planId || typeof planId !== "string") {
      res.status(400).json({ success: false, error: "Invalid planId" });
      return;
    }
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    const tasks = await getTodayTasks(planId, clerkUserId);
    res.json({ success: true, tasks });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const handleGetTasksWeekly = async (req: Request, res: Response) => {
  try {
    const planId = req.params.planId;
    if (!planId || typeof planId !== "string") {
      res.status(400).json({ success: false, error: "Invalid planId" });
      return;
    }
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    const tasks = await getWeeklyTasks(planId, clerkUserId);
    res.json({ success: true, tasks });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const handleGetTasksMonthly = async (req: Request, res: Response) => {
  try {
    const planId = req.params.planId;
    if (!planId || typeof planId !== "string") {
      res.status(400).json({ success: false, error: "Invalid planId" });
      return;
    }
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    const tasks = await getMonthlyTasks(planId, clerkUserId);
    res.json({ success: true, tasks });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const handleGetTasksRange = async (req: Request, res: Response) => {
  try {
    const planId = req.params.planId;
    if (!planId || typeof planId !== "string") {
      res.status(400).json({ success: false, error: "Invalid planId" });
      return;
    }
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const startRaw = req.query.start;
    const endRaw = req.query.end;
    if (!startRaw || !endRaw) {
      res.status(400).json({
        success: false,
        error: "Missing required query params: start, end",
      });
      return;
    }

    const startDate = new Date(String(startRaw));
    const endDate = new Date(String(endRaw));
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      res.status(400).json({
        success: false,
        error: "Invalid date format. Use ISO strings for start/end.",
      });
      return;
    }

    const tasks = await getTasksForDateRange(
      planId,
      clerkUserId,
      startDate,
      endDate
    );
    res.json({ success: true, tasks });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const handleCompleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.taskId;
    if (!taskId || typeof taskId !== "string") {
      res.status(400).json({ success: false, error: "Invalid taskId" });
      return;
    }
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { instanceDate, completed } = req.body ?? {};

    let parsedInstanceDate: Date | undefined;
    if (instanceDate) {
      const d = new Date(instanceDate);
      if (Number.isNaN(d.getTime())) {
        res.status(400).json({
          success: false,
          error: "Invalid instanceDate. Use ISO string.",
        });
        return;
      }
      parsedInstanceDate = d;
    }

    const completedBool =
      typeof completed === "boolean" ? completed : true;

    const result = await completeTask(
      taskId,
      clerkUserId,
      parsedInstanceDate,
      completedBool
    );

    res.json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const handleGetPlanAnalytics = async (req: Request, res: Response) => {
  try {
    const planId = req.params.planId;
    if (!planId || typeof planId !== "string") {
      res.status(400).json({ success: false, error: "Invalid planId" });
      return;
    }
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const timeframeRaw = req.query.timeframe;
    const timeframe =
      timeframeRaw === "daily" || timeframeRaw === "weekly" || timeframeRaw === "monthly"
        ? timeframeRaw
        : "weekly";

    const analytics = await getUserAnalytics(clerkUserId, planId, timeframe);
    res.json({ success: true, analytics });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const handleGetTaskAnalytics = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.taskId;
    if (!taskId || typeof taskId !== "string") {
      res.status(400).json({ success: false, error: "Invalid taskId" });
      return;
    }
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const daysRaw = req.query.days;
    const days = daysRaw ? Number(String(daysRaw)) : 30;
    const safeDays = Number.isFinite(days) && days > 0 ? days : 30;

    const analytics = await getTaskAnalytics(taskId, clerkUserId, safeDays);
    res.json({ success: true, analytics });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

