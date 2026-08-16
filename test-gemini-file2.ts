import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
async function test() {
  const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  fs.writeFileSync('test.txt', 'hello world');
  const upload = await ai.files.upload({ file: 'test.txt', mimeType: 'text/plain' });
  console.log(upload.uri);
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: [{ role: 'user', parts: [{ fileData: { fileUri: upload.uri, mimeType: 'text/plain' } }, { text: 'what does this say?' }] }]
  });
  console.log(response.text);
}
test().catch(console.error);
