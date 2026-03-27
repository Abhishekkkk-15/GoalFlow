import { Request, Response } from "express";
import { PromptTemplate } from "@langchain/core/prompts";
import { llm } from "../config/llm";
import { prompt } from "../promptTemplate/plan.tempalate";
import { extractPlanJSON } from "../lib/jsonExtractor";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { plan as Plan } from "../models/plan.model";
import { Task } from "../models/task.mode";
import { getAuth } from "@clerk/express";
import { User } from "../models/user.mode";
import { Types } from "mongoose";
import {
  getMonthKey,
  getTokensUsedForMonth,
  incrementTokensUsedForMonth,
} from "../services/tokenUsage.service";
interface IQAndA {
  question: string;
  answer: {
    questionId: string;
    answer: string | string[];
  };
}

export interface PlanCategory {
  id: string;
  name: string;
  tasks: PlanTask[];
  description: string;
}
export interface PlanTask {
  id: string;
  title: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "once" | "one-time";
  startDate: Date;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
  dueDate: Date;
}
const getPresentTimeAndDate = tool<any, any>(
  async () => new Date().toISOString(),
  {
    name: "getPresentTimeAndDate",
    description: "Get the current date and time in ISO format",
    schema: z.object({}), // no inputs
  }
);

export const generateNewPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { qAnda }: { qAnda: IQAndA[] } = req.body;

    if (!qAnda) res.status(404).json({ message: "Question not provided" });
    const categories =
      qAnda.find((q) => q.question === "Where do you want to improve?")
        ?.answer || [];
    const formattedUserData = JSON.stringify(qAnda, null, 2);
    const auth = getAuth(req);

    const monthKey = getMonthKey(new Date());
    const user = await getUserWitlClerkId(auth.userId as string);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authenticated user",
      });
      return;
    }
    const currentTokensUsed = await getTokensUsedForMonth(user._id, monthKey);

    const isPro = user.planTier === "pro";
    const isBlocked = !isPro && currentTokensUsed >= 3000;
    if (isBlocked) {
      res.status(402).json({
        success: false,
        error: "Free plan token limit reached. Upgrade for unlimited access.",
        usage: {
          monthKey,
          tokensUsed: currentTokensUsed,
          limit: 3000,
          planTier: user.planTier,
        },
      });
      return;
    }
    const input = await prompt.format({
      userData: formattedUserData,
      categories,
      CURRENT_DATE: new Date().toISOString(),
    });
    const llmWithTool = llm.bindTools([getPresentTimeAndDate]);
    const response = await llm.invoke(input);
    const parsedData = extractPlanJSON(response.text);
    const savedData = await storePlanInDBWithInsertMany(user._id, parsedData);

    const tokenUsage =
      (response as any)?.response_metadata?.usage?.total_tokens ?? 0;
    const updatedTokensUsed = await incrementTokensUsedForMonth(
      user._id,
      monthKey,
      tokenUsage
    );
    res.status(200).json({ message: "Done", data: savedData, success: true });
  } catch (error) {
    console.log("Error : ", error);
  }
};

async function storePlanInDBWithInsertMany(
  userId: Types.ObjectId,
  parsedData: any
) {
  try {
    const plan = new Plan({
      user: userId,
      title: parsedData.title,
      categories: parsedData.plan.map((category: PlanCategory) => ({
        name: category.name,
        description: category.description,
      })),
      isActive: parsedData.isActive,
    });

    const savedPlan = await plan.save();

    const tasksToInsert = parsedData.tasks.map((taskData: PlanTask) => ({
      plan: savedPlan._id,
      title: taskData.title,
      description: taskData.description,
      completed: taskData.completed,
      category: taskData.category,
      frequency: taskData.frequency === "once" ? "once" : taskData.frequency,
      startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      priority: taskData.priority,
      isRecurring: taskData.frequency !== "once",
      recurrence:
        taskData.frequency === "daily" ||
        taskData.frequency === "weekly" ||
        taskData.frequency === "monthly" ||
        taskData.frequency === "quarterly"
          ? {
              pattern: taskData.frequency as any,
              interval: 1,
              ...(taskData.frequency === "weekly"
                ? {
                    daysOfWeek: [
                      taskData.startDate
                        ? new Date(taskData.startDate).getDay()
                        : 1,
                    ],
                  }
                : {}),
              ...(taskData.frequency === "monthly" ||
              taskData.frequency === "quarterly"
                ? {
                    dayOfMonth: taskData.startDate
                      ? new Date(taskData.startDate).getDate()
                      : 1,
                  }
                : {}),
            }
          : undefined,
    }));

    const insertedTasks = await Task.insertMany(tasksToInsert);
    const taskIds = insertedTasks.map((task) => task._id);

    savedPlan.tasks = taskIds;
    await savedPlan.save();

    // Mark as current plan for the user
    await User.findOneAndUpdate(
      { _id: userId },
      { currentPlan: savedPlan._id },
      { new: true }
    );

    // Return complete document with populated tasks
    return await Plan.findById(savedPlan._id).populate("tasks");
  } catch (error) {
    console.error("Error storing plan in database:", error);
    throw error;
  }
}

async function getUserWitlClerkId(clerkId: string) {
  return User.findOne({
    clerkId,
  });
}
