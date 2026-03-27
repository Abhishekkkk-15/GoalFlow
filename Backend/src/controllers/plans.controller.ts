import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { plan as PlanModel } from "../models/plan.model";
import { User } from "../models/user.mode";

export const handleGetCurrentPlan = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ clerkId: clerkUserId }).select(
      "_id currentPlan"
    );
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    if (!user.currentPlan) {
      res.status(404).json({ success: false, error: "No current plan found" });
      return;
    }

    const currentPlan = await PlanModel.findOne({
      _id: user.currentPlan,
      user: user._id,
    }).populate("tasks");

    if (!currentPlan) {
      res.status(404).json({ success: false, error: "Plan not found" });
      return;
    }

    res.json({ success: true, plan: currentPlan });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, error: error?.message ?? "Server error" });
  }
};

