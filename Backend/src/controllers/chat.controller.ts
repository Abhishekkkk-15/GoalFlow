import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { z } from "zod";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { llm } from "../config/llm";
import { User } from "../models/user.mode";
import { Chat } from "../models/chat.model";
import {
  getMonthKey,
  getTokensUsedForMonth,
  incrementTokensUsedForMonth,
} from "../services/tokenUsage.service";

const FREE_MONTHLY_TOKEN_LIMIT = 3000;

const sendMessageSchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

const getDbUserFromClerk = async (clerkUserId: string) => {
  return User.findOne({ clerkId: clerkUserId });
};

export const handleGetChat = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const user = await getDbUserFromClerk(clerkUserId);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const chat = await Chat.findOne({ user: user._id });
    const monthKey = getMonthKey(new Date());
    const tokensUsed = await getTokensUsedForMonth(user._id, monthKey);

    res.json({
      success: true,
      chat: chat ?? { user: user._id, messages: [] },
      usage: {
        monthKey,
        tokensUsed,
        limit: user.planTier === "pro" ? null : FREE_MONTHLY_TOKEN_LIMIT,
        planTier: user.planTier,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

export const handleSendChatMessage = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Invalid message" });
      return;
    }

    const user = await getDbUserFromClerk(clerkUserId);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const monthKey = getMonthKey(new Date());
    const currentTokensUsed = await getTokensUsedForMonth(user._id, monthKey);

    const isPro = user.planTier === "pro";
    const isBlocked = !isPro && currentTokensUsed >= FREE_MONTHLY_TOKEN_LIMIT;
    if (isBlocked) {
      res.status(402).json({
        success: false,
        error: "Free plan token limit reached. Upgrade for unlimited access.",
        usage: {
          monthKey,
          tokensUsed: currentTokensUsed,
          limit: FREE_MONTHLY_TOKEN_LIMIT,
          planTier: user.planTier,
        },
      });
      return;
    }

    const chat = await Chat.findOneAndUpdate(
      { user: user._id },
      {
        $setOnInsert: { user: user._id },
        $push: {
          messages: {
            sender: "user",
            message: parsed.data.message,
            timestamp: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    const history = (chat.messages ?? []).slice(-20);
    const lcMessages = history.map((m) =>
      m.sender === "user"
        ? new HumanMessage(m.message)
        : new AIMessage(m.message)
    );

    const ai = await llm.invoke(lcMessages);
    const aiText =
      typeof ai.content === "string" ? ai.content : String(ai.content);

    const tokenUsage = (ai as any)?.response_metadata?.usage?.total_tokens ?? 0;
    const updatedTokensUsed = await incrementTokensUsedForMonth(
      user._id,
      monthKey,
      tokenUsage
    );

    const limitReachedNow =
      !isPro && updatedTokensUsed >= FREE_MONTHLY_TOKEN_LIMIT;

    const updatedChat = await Chat.findOneAndUpdate(
      { user: user._id },
      {
        $push: {
          messages: {
            sender: "ai",
            message: aiText,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      reply: aiText,
      chat: updatedChat,
      usage: {
        monthKey,
        tokensUsed: updatedTokensUsed,
        limit: isPro ? null : FREE_MONTHLY_TOKEN_LIMIT,
        planTier: user.planTier,
        limitReached: limitReachedNow,
        tokenUsage,
      },
    });
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};
