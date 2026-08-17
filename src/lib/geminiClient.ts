import { GoogleGenAI } from "@google/genai";

// Ensure we have an API key available, using vite's env replacement
const apiKey = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

const executeWithRetry = async (operation: any, maxRetries = 5) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err: any) {
      const errStr = String(err);
      const is503 = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("high demand") || errStr.includes("overloaded");
      const is429 = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota");
      
      if ((is503 || is429) && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1500 + Math.random() * 1000;
        console.warn(`[Gemini API] busy (${is503 ? '503' : '429'}), retrying in ${Math.round(delay)}ms... (Attempt ${i+1}/${maxRetries-1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
};

export const extractAgendaClient = async (
  prompt: string,
  fileBase64: string | null,
  mimeType: string | null,
  fileId: string | null,
  accessToken: string | null
) => {
  if (!apiKey) {
    throw new Error("مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) غير موجود.");
  }

  let finalBase64 = fileBase64;
  let finalMime = mimeType;

  // If coming from drive, fetch and convert to base64
  if (fileId && accessToken && !finalBase64) {
    let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    
    // Check metadata for google apps
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (metaRes.ok) {
      const meta = await metaRes.json();
      finalMime = meta.mimeType;
      
      if (finalMime === 'application/vnd.google-apps.document' || finalMime === 'application/vnd.google-apps.presentation' || finalMime === 'application/vnd.google-apps.spreadsheet') {
         downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
         finalMime = 'application/pdf';
      }
      
      const fileRes = await fetch(downloadUrl, {
         headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (fileRes.ok) {
         const arrayBuffer = await fileRes.arrayBuffer();
         finalBase64 = btoa(
           new Uint8Array(arrayBuffer)
             .reduce((data, byte) => data + String.fromCharCode(byte), '')
         );
      } else {
         throw new Error("فشل تحميل الملف من جوجل درايف");
      }
    }
  }

  let contents: any[] = [{ text: prompt }];
  
  if (finalBase64 && finalMime) {
      // Remove base64 prefix if exists
      if (finalBase64.includes('base64,')) {
         finalBase64 = finalBase64.split('base64,')[1];
      }
      contents = [
          { inlineData: { data: finalBase64, mimeType: finalMime } },
          { text: prompt }
      ];
  }

  const response = await executeWithRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: contents }]
  }));

  return response.text;
};

export const replyToLetterClient = async (
  incomingLetter: string,
  fileBase64: string | null,
  mimeType: string | null
) => {
  if (!apiKey) {
    throw new Error("مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) غير موجود.");
  }

  const fullPrompt = `أنت خبير في صياغة الخطابات الرسمية في المملكة العربية السعودية (وتحديداً غرفة مكة المكرمة).
تم استلام الخطاب التالي:
---
${incomingLetter || "مرفق في الملف"}
---
المطلوب:
1. صياغة رد رسمي احترافي ولبق.
2. استخدام الألقاب المناسبة.
3. الرد يكون مباشراً وبدون مقدمات طويلة غير ضرورية.
4. يرجى توفير الخطاب كـ HTML منسق (استخدم <p>، <strong>، <br> الخ) لتسهيل عرضه في المحرر. لا تستخدم Markdown في النتيجة أبدًا، فقط HTML نظيف. لا تضع أي ردود أو نصوص قبل أو بعد الـ HTML. ابدأ بالـ HTML مباشرة.`;

  let contents: any[] = [{ text: fullPrompt }];
  
  if (fileBase64 && mimeType) {
      let finalBase64 = fileBase64;
      if (finalBase64.includes('base64,')) {
         finalBase64 = finalBase64.split('base64,')[1];
      }
      contents = [
          { inlineData: { data: finalBase64, mimeType: mimeType } },
          { text: fullPrompt }
      ];
  }

  const response = await executeWithRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: contents }]
  }));

  return response.text;
};
