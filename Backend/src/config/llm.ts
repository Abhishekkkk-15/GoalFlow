import { ChatGroq } from "@langchain/groq";
import { config } from "dotenv";
config();
export const llm = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  apiKey: process.env.GROQ_API_KEY,
});
