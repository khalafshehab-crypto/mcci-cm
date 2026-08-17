import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  const res = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: ["say hi"]
  });
  console.log(res.text);
}
test().catch(console.error);
