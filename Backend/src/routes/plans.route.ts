import express from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import { handleGetCurrentPlan } from "../controllers/plans.controller";

const router = express.Router();
router.use(clerkMiddleware());
router.use(requireAuth());

router.get("/plans/current", handleGetCurrentPlan);

export default router;

