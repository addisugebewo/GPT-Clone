import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Create Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

// Export AI client
export default ai;
