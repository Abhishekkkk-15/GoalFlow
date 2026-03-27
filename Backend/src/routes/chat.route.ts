import express from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import { handleGetChat, handleSendChatMessage } from "../controllers/chat.controller";

const router = express.Router();
router.use(clerkMiddleware());
router.use(requireAuth());

router.get("/chat", handleGetChat);
router.post("/chat", handleSendChatMessage);

export default router;

