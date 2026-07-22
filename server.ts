import * as fs from "fs";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json({ limit: "50mb" }));
  app.post('/api/log-client-error', (req, res) => {
    
    fs.appendFileSync('client_errors.log', JSON.stringify(req.body) + '\n');
    res.json({ ok: true });
  });


  // API route for Gmail Proxy to bypass CORS lock in the browser
  app.post("/api/gmail-send", async (req, res) => {
    try {
      const { token, raw } = req.body;
      if (!token) {
        return res.status(400).json({ error: { message: "Access token is required" } });
      }
      if (!raw) {
        return res.status(400).json({ error: { message: "Raw message content is required" } });
      }

      const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      });

      const responseData = await response.text();
      if (!response.ok) {
        return res.status(response.status).json({ error: { message: responseData } });
      }

      let parsed = {};
      try {
        parsed = JSON.parse(responseData);
      } catch (e) {
        parsed = { rawData: responseData };
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error("Gmail Proxy Error:", err);
      return res.status(500).json({ error: { message: err.message || "Internal Server Error" } });
    }
  });

  // API route for Generic Google Proxy to bypass CORS lock in the browser for Drive, Sheets, Slides, Docs, etc.
  app.post("/api/google-proxy", async (req, res) => {
    try {
      const { token, url, method, body, headers } = req.body;
      if (!token) {
        return res.status(400).json({ error: { message: "Access token is required" } });
      }
      if (!url) {
        return res.status(400).json({ error: { message: "URL is required" } });
      }

      const reqHeaders: Record<string, string> = {
        "Authorization": `Bearer ${token}`,
        ...headers,
      };

      const fetchOptions: RequestInit = {
        method: method || "GET",
        headers: reqHeaders,
      };

      if (body) {
        fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
      }

      console.log(`[Google Proxy] Forwarding ${method || "GET"} request to ${url}`);
      const response = await fetch(url, fetchOptions);

      if (response.status === 204) {
        return res.status(204).end();
      }

      const responseData = await response.text();
      if (!response.ok) {
        return res.status(response.status).json({ error: { message: responseData } });
      }

      let parsed = {};
      try {
        parsed = JSON.parse(responseData);
      } catch (e) {
        parsed = { rawData: responseData };
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error("Google Proxy Error:", err);
      return res.status(500).json({ error: { message: err.message || "Internal Server Error" } });
    }
  });

  
  
  app.post("/api/gemini/generate-new-letter", async (req, res) => {
    try {
      const { committeeName, recipientName, recipientPosition, subject, details, contact, attachments, signatory } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      const fullPrompt = `أنت كاتب خطابات رسمية محترف في المملكة العربية السعودية (وتحديداً غرفة مكة المكرمة).
المطلوب إعداد خطاب رسمي نهائي وجاهز، بناءً على المعطيات التالية:
اللجنة: ${committeeName || "غير محدد"}
المرسل إليه: ${recipientName || "غير محدد"}
منصبه: ${recipientPosition || "غير محدد"}
الموضوع: ${subject || "غير محدد"}
تفاصيل الخطاب: ${details || "لا يوجد تفاصيل إضافية"}
ضابط الاتصال: ${contact || "لا يوجد"}
مرفقات الخطاب: ${attachments || "لا يوجد"}
الشخص الذي سيوقع الخطاب: ${signatory || "الأمين العام"}

يجب أن يكون الخطاب مصاغاً بناءً على الهيكل التالي المعتمد لدينا:
[التاريخ الهجري والميلادي يمكن تركه كمتغير مثل: التاريخ: .... / .... / ....هـ]

سعادة ${recipientName} سلمه الله
${recipientPosition}

السلام عليكم ورحمة الله وبركاته، وبعد:

تهديكم غرفة مكة المكرمة أطيب تحية، بناءً على توصيات (${committeeName}) ... 
[صغ محتوى الخطاب بناءً على التفاصيل المعطاة بطريقة رسمية جداً وواضحة ومقنعة]

[في حال وجود ضابط اتصال، أشر إليه للتواصل]
[في حال وجود مرفقات، أشر إليها]

شاكرين ومقدرين دعم واهتمام سعادتكم،

${signatory}

أعد نص الخطاب فقط بدون أي شروحات إضافية وبدون استخدام markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
      });

      return res.json({ result: response.text });
    } catch (err) {
      console.error("Gemini Generate New Letter Error:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });

  app.post("/api/gemini/generate-letter", async (req, res) => {
    try {
      const { prompt, templateContent } = req.body;
      if (!prompt || !templateContent) {
        return res.status(400).json({ error: "Missing prompt or templateContent" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const fullPrompt = `
You are an expert Arabic official letter writer.
You have been given a template for an official letter. The user will provide instructions on how to fill in the variables.
Maintain the exact structure, formatting, and formal tone of the template.
Only change the specific fields (like names, dates, subject, etc.) as requested by the user.

Template:
${templateContent}

User Instructions:
${prompt}

Output ONLY the final Arabic text of the letter, ready to be printed or used. Do not include markdown blocks or any other commentary.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
      });

      return res.json({ result: response.text });
    } catch (err: any) {
      console.error("Gemini Generate Letter Error:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });

  app.post("/api/gemini/reply-to-letter", async (req, res) => {
    try {
      const { incomingLetter, fileBase64, mimeType } = req.body;
      if (!incomingLetter && !fileBase64) {
        return res.status(400).json({ error: "Missing incomingLetter text or file" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const fullPrompt = `أنت خبير في صياغة الخطابات الرسمية في المملكة العربية السعودية (وتحديداً غرفة مكة المكرمة).
تم استلام الخطاب التالي:
---
${incomingLetter || "مرفق في الملف"}
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

أعد نص قالب الخطاب فقط بدون أي شروحات إضافية وبدون استخدام markdown (فقط النص).`;

      let contents: any[] = [fullPrompt];
      if (fileBase64 && mimeType) {
        contents = [
          { inlineData: { data: fileBase64, mimeType: mimeType } },
          fullPrompt
        ];
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
      });

      return res.json({ result: response.text });
    } catch (err: any) {
      console.error("Gemini Reply to Letter Error:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });


  app.post("/api/gemini/smart-recommendation", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing text" });
      }
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const fullPrompt = `أنت خبير في صياغة التوصيات الإدارية والمحاضر الرسمية باللغة العربية للجان القطاعية.
قم بإعادة صياغة النص التالي ليكون توصية رسمية احترافية، دقيقة، وواضحة.
حافظ على المعنى الأصلي، ولكن اجعله بصيغة رسمية معتمدة في القطاع الحكومي والخاص (مثل: "نوصي بـ..."، "العمل على..."، "التأكيد على...").
أعد النص فقط بدون أي مقدمات أو شروحات إضافية.

النص الأصلي:
${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
      });

      return res.json({ result: response.text });
    } catch (err) {
      console.error("Gemini Smart Recommendation Error:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });

  // API health check

  app.post("/api/fetch-public-sheet", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: "URL is required" });
      
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch from URL" });
      }
      
      const buffer = await response.arrayBuffer();
      res.set('Content-Type', 'application/octet-stream');
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error("Fetch Public Sheet Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  
  app.post("/api/log", express.json(), (req, res) => {
    fs.appendFileSync('client_errors.log', JSON.stringify(req.body) + '\n');
    res.json({ ok: true });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
