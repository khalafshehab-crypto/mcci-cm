const fs = require('fs');

fs.mkdirSync('api/gemini', { recursive: true });

fs.writeFileSync('api/gemini/reply-to-letter.ts', `
import { GoogleGenAI } from "@google/genai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  try {
    const { incomingLetter, fileBase64, mimeType } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const fullPrompt = \`أنت خبير في صياغة الخطابات الرسمية في المملكة العربية السعودية (وتحديداً غرفة مكة المكرمة).
تم استلام الخطاب التالي:
---
\${incomingLetter || "مرفق في الملف"}
---
المطلوب:
إعداد قالب خطاب رد رسمي على هذا الخطاب الوارد (سواء كنص أو كملف مرفق).
يجب أن يحتوي القالب على متغيرات محاطة بأقواس مربعة مثل [الاسم]، [التاريخ]، [الموضوع] لكي يقوم المستخدم بتعبئتها لاحقاً.
يجب أن يكون الرد مصاغاً بناءً على الهيكل التالي المعتمد لدينا:

الموضوع: [موضوع الخطاب]

سعادة [لقب واسم المرسل إليه] سلمه الله
[منصب الجهة المرسل إليها]
السلام عليكم ورحمة الله وبركاته، وبعد:

تهديكم غرفة مكة المكرمة أطيب تحية، [ثم تكملة الديباجة المناسبة] ...

[محتوى الرد مقسم لفقرات واضحة ومرتبة]

شاكرين ومقدرين دعم واهتمام سعادتكم،

أمين عام غرفة مكة المكرمة
د. ثامر بن أحمد باعظيم

أعد نص قالب الخطاب فقط بدون أي شروحات إضافية وبدون استخدام markdown (فقط النص).\`;

    let contents = [{ text: fullPrompt }];
    if (fileBase64 && mimeType) {
      contents = [
        { inlineData: { data: fileBase64, mimeType: mimeType } } as any,
        { text: fullPrompt }
      ];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
    });

    return res.status(200).json({ result: response.text });
  } catch (err: any) {
    console.error("Vercel Gemini Reply to Letter Error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
`);

fs.writeFileSync('api/gemini/generate-letter.ts', `
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const { prompt, templateContent } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const fullPrompt = \`You are an expert Arabic official letter writer.
You have been given a template for an official letter. The user will provide instructions on how to fill in the variables.
Maintain the exact structure, formatting, and formal tone of the template.
Only change the specific fields (like names, dates, subject, etc.) as requested by the user.
Template:
\${templateContent}

User Instructions:
\${prompt}

Output ONLY the final Arabic text of the letter, ready to be printed or used. Do not include markdown blocks or any other commentary.\`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
    });
    return res.status(200).json({ result: response.text });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
`);

fs.writeFileSync('api/gemini/smart-recommendation.ts', `
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const { text } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const fullPrompt = \`أنت خبير في صياغة التوصيات الإدارية والمحاضر الرسمية باللغة العربية للجان القطاعية.
قم بإعادة صياغة النص التالي ليكون توصية رسمية احترافية، دقيقة، وواضحة.
حافظ على المعنى الأصلي، ولكن اجعله بصيغة رسمية معتمدة في القطاع الحكومي والخاص (مثل: "نوصي بـ..."، "العمل على..."، "التأكيد على...").
أعد النص فقط بدون أي مقدمات أو شروحات إضافية.
النص الأصلي:
\${text}\`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
    });
    return res.status(200).json({ result: response.text });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
`);

fs.writeFileSync('vercel.json', JSON.stringify({
  rewrites: [
    {
      source: "/(.*)",
      destination: "/index.html"
    }
  ]
}, null, 2));

console.log("Vercel APIs and config created.");
