import express from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import {
  handleCreateBillingPortalSession,
  handleCreateCheckoutSession,
} from "../controllers/billing.controller";

const router = express.Router();
router.use(clerkMiddleware());
router.use(requireAuth());

router.post("/billing/checkout", handleCreateCheckoutSession);
router.post("/billing/portal", handleCreateBillingPortalSession);

export default router;

