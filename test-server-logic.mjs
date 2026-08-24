import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import os from 'os';
import path from 'path';

async function uploadBase64ToGemini(ai, fileBase64, mimeType) {
    let base64Data = fileBase64;
    if (base64Data.includes('base64,')) {
        base64Data = base64Data.split('base64,')[1];
    }
    const ext = mimeType === 'application/pdf' ? '.pdf' : '.tmp';
    const tmpPath = path.join(os.tmpdir(), 'gemini_upload_' + Date.now() + Math.floor(Math.random() * 1000) + ext);
    fs.writeFileSync(tmpPath, Buffer.from(base64Data, 'base64'));
    const upload = await ai.files.upload({ file: tmpPath, config: { mimeType: mimeType } });
    fs.unlinkSync(tmpPath);
    return upload.uri;
}

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const uri = await uploadBase64ToGemini(ai, "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "image/png");
console.log("URI:", uri);

const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: { parts: [ { fileData: { fileUri: uri, mimeType: "image/png" } }, { text: "Hello" } ] }
});
console.log("Response:", response.text);
