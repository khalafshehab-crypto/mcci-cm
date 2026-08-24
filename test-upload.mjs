import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY || 'dummy'});
console.log("ai.files:", !!ai.files);
const testFile = 'test.txt';
fs.writeFileSync(testFile, 'hello world');
try {
  const result = await ai.files.upload({ file: testFile, config: { mimeType: 'text/plain' } });
  console.log("Upload result:", result);
} catch (err) {
  console.error("Upload error:", err.message);
}
