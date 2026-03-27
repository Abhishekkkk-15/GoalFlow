import express from "express";
import { generateNewPlan } from "../controllers/onboarding.controller";
import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";

const router = express.Router();
router.use(clerkMiddleware());
router.post("/generate-plan", generateNewPlan);
export default router;
