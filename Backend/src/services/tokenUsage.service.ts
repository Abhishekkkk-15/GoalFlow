import { Types } from "mongoose";
import { TokenUsage } from "../models/tokenUsage.model";

export const getMonthKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const getTokensUsedForMonth = async (
  userId: Types.ObjectId,
  monthKey: string
) => {
  const usage = await TokenUsage.findOne({ user: userId, monthKey });
  return usage?.tokensUsed ?? 0;
};

export const incrementTokensUsedForMonth = async (
  userId: Types.ObjectId,
  monthKey: string,
  inc: number
) => {
  const safeInc = Number.isFinite(inc) && inc > 0 ? Math.floor(inc) : 0;
  const updated = await TokenUsage.findOneAndUpdate(
    { user: userId, monthKey },
    { $inc: { tokensUsed: safeInc } },
    { new: true, upsert: true }
  );
  return updated.tokensUsed;
};

