import express from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import {
  handleGetTasksMonthly,
  handleGetTasksRange,
  handleGetTasksToday,
  handleGetTasksWeekly,
  handleCompleteTask,
  handleGetPlanAnalytics,
  handleGetTaskAnalytics,
} from "../controllers/tasks.controller";

const router = express.Router();
router.use(clerkMiddleware());
router.use(requireAuth());

router.get("/plans/:planId/tasks/today", handleGetTasksToday);
router.get("/plans/:planId/tasks/weekly", handleGetTasksWeekly);
router.get("/plans/:planId/tasks/monthly", handleGetTasksMonthly);
router.get("/plans/:planId/tasks/range", handleGetTasksRange);

router.post("/tasks/:taskId/complete", handleCompleteTask);

router.get("/plans/:planId/analytics", handleGetPlanAnalytics);
router.get("/tasks/:taskId/analytics", handleGetTaskAnalytics);

export default router;

