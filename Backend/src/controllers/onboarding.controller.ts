import { Request, Response } from "express";
import { PromptTemplate } from "@langchain/core/prompts";
import { llm } from "../config/llm";
import { prompt } from "../promptTemplate/plan.tempalate";
import { extractPlanJSON } from "../lib/jsonExtractor";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
interface IQAndA {
  question: string;
  answer: {
    questionId: string;
    answer: string | string[];
  };
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

    const formattedUserData = JSON.stringify(qAnda, null, 2);

    const input = await prompt.format({
      userData: formattedUserData,
    });
    const llmWithTool = llm.bindTools([getPresentTimeAndDate]);
    const response = await llm.invoke(input);
    console.log("AI response : ", response);
    const parsedData = extractPlanJSON(response.text);
    console.log("Parsed Res :", parsedData);

    res.status(200).json({ message: "Done", data: parsedData });
  } catch (error) {
    console.log("Error : ", error);
  }
};
