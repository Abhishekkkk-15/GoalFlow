import express from "express";
import { generateNewPlan } from "../controllers/onboarding.controller";
const router = express.Router();

router.post("/generate-plan", generateNewPlan);
export default router;
