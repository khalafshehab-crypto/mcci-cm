import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: [{ role: 'user', parts: [{ inlineData: { data: 'SGVsbG8=', mimeType: 'text/plain' } }, { text: 'hi' }] }]
}).then(res => console.log(res.text)).catch(console.error);
