
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const { prompt, templateContent } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const fullPrompt = `You are an expert Arabic official letter writer.
You have been given a template for an official letter. The user will provide instructions on how to fill in the variables.
Maintain the exact structure, formatting, and formal tone of the template.
Only change the specific fields (like names, dates, subject, etc.) as requested by the user.
Template:
${templateContent}

User Instructions:
${prompt}

Output ONLY the final Arabic text of the letter, ready to be printed or used. Do not include markdown blocks or any other commentary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
    });
    return res.status(200).json({ result: response.text });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
