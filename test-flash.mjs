import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
try {
  const result = await ai.models.generateContent({ model: "gemini-3.7-flash", contents: "Hello" });
  console.log("Success:", result.text);
} catch (e) {
  console.error("Error:", e.message);
}
