import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
console.log(typeof ai.files.upload);
