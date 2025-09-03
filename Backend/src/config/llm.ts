import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "dotenv";
config();
console.log(process.env.GEMINI_API_KEY);
export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0,
  maxRetries: 2,
  apiKey: process.env.GEMINI_API_KEY,
});
