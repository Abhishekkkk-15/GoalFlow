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
  timeframe: string;
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

    const user = await getUserWitlClerkId(auth.userId as string);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authenticated user",
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
    console.log("Parsed Res :", parsedData);
    const savedData = await storePlanInDBWithInsertMany(user._id, parsedData);
    res.status(200).json({ message: "Done", data: parsedData, success: true });
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
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
    }));

    const insertedTasks = await Task.insertMany(tasksToInsert);
    const taskIds = insertedTasks.map((task) => task._id);

    savedPlan.tasks = taskIds;
    await savedPlan.save();

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
