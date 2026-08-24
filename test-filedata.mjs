import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const testFile = 'test2.txt';
fs.writeFileSync(testFile, 'hello world 2');
try {
  const upload = await ai.files.upload({ file: testFile, config: { mimeType: 'text/plain' } });
  console.log("Upload uri:", upload.uri);
  const result = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: { parts: [{ fileData: { fileUri: upload.uri, mimeType: 'text/plain' } }, { text: "What is this file?" }] }
  });
  console.log("Success with uri:", result.text);
} catch (err) {
  console.error("Error with uri:", err.message);
}
