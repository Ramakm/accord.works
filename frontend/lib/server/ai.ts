import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_DEFAULT = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: MODEL_DEFAULT });
}

export function extractJson(text: string): any {
  try {
    const fence = /```json\s*([\s\S]*?)\s*```/i;
    const m = text.match(fence);
    const body = m ? m[1] : text;
    return JSON.parse(body);
  } catch (e) {
    return null;
  }
}
