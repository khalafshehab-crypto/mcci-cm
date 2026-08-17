import os from "os";
import * as fs from "fs";
import express from "express";
import cors from "cors";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors({ origin: true }));
export default app;



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
      const { mode, prompt, replyFileBase64, replyFileMimeType, committeeName, recipientName, recipientPosition, subject, details, contact, attachments, signatory, workspaceService } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      const contents = [];
      
      if (replyFileBase64 && replyFileMimeType) {
        contents.push({
          inlineData: {
            data: replyFileBase64,
            mimeType: replyFileMimeType
          }
        });
      }
      
      let finalPrompt = prompt;
      if (!finalPrompt) {
          if (workspaceService === 'docs' || workspaceService === 'gmail' || !workspaceService) {
            finalPrompt = `أنت خبير صياغة خطابات رسمية سعودية في الغرفة التجارية (غرفة مكة المكرمة).
يرجى صياغة خطاب رسمي احترافي بناءً على المعطيات التالية:
المرسل إليه (اسمه أو صفته): ${recipientName || 'المكرم'}
منصبه: ${recipientPosition || ''}
موضوع الخطاب: ${subject || 'خطاب رسمي'}
التفاصيل والنقاط المطلوبة في الخطاب: ${details}
لجنة: ${committeeName || 'إدارة اللجان'}
جهة التوقيع: ${signatory || ''}
معلومات التواصل (إن وجدت): ${contact || ''}
المرفقات (إن وجدت): ${attachments || ''}

يجب أن يكون الخطاب بنفس التنسيق والهيكلة المرجعية التالية للخطابات الرسمية، مع استبدال البيانات لتناسب المعطيات المطلوبة أعلاه:

سعادة / [اسم المرسل إليه]                                                            سلمه الله
[المنصب]

السلام عليكم ورحمة الله وبركاته..

تهديكم غرفة مكة المكرمة أطيب تحية .. [مقدمة الخطاب الرسمية والترحيب المناسب لموضوع الخطاب]

[نص الخطاب التفصيلي يعبر بوضوح عن النقاط المذكورة في "التفاصيل والنقاط المطلوبة" بأسلوب إداري رصين ومحكم]

سائلين الله عز وجل لسعادتكم دوام التوفيق والسداد، ولغرفتنا الموقرة المزيد من التقدم والازدهار.

[إذا كان هناك معلومات تواصل أضف فقرة التواصل: لمزيد من التواصل والمعلومات يمكنكم الإيعاز لمن يلزم للتواصل مع...]

وتفضلوا بقبول خالص التحية والتقدير،،،

[جهة التوقيع أو المنصب]
[الاسم إذا توفر]

ملاحظة هامة: أخرج الخطاب فقط بدون أي شروحات إضافية وبدون استخدام علامات Markdown مثل ''' ، وتأكد من محاكاة التنسيق بدقة، فقط النص الجاهز الصافي للخطاب.`;
          } else {
             finalPrompt = `أنت مساعد ذكي ومحترف. المطلوب إنشاء محتوى احترافي (نوع ${workspaceService}) للموضوع: ${subject}. التفاصيل: ${details}. الجهة: ${committeeName}.`;
          }
      }
      
      contents.push(finalPrompt);

      const response = await executeWithRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash", // use pro since it could be reading a pdf/image reply
        contents: contents,
      }));

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

      const response = await executeWithRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
      }));

      return res.json({ result: response.text });
    } catch (err: any) {
      console.error("Gemini Generate Letter Error:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });


  app.post("/api/gemini/extract-agenda", async (req, res) => {
    try {
      let { prompt, fileBase64, mimeType, fileId, accessToken } = req.body;
      let uploadedFileUri = null;
      let uploadedFileMime = null;
      
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      if (fileId && accessToken && !fileBase64) {
          try {
              const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name`, {
                  headers: { Authorization: `Bearer ${accessToken}` }
              });
              if (metaRes.ok) {
                  const meta = await metaRes.json();
                  mimeType = meta.mimeType;
                  let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
                  let ext = ".pdf";
                  
                  if (mimeType === 'application/vnd.google-apps.document') {
                      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
                      mimeType = 'application/pdf';
                  } else if (mimeType === 'application/vnd.google-apps.presentation') {
                      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
                      mimeType = 'application/pdf';
                  } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
                      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`;
                      mimeType = 'text/csv';
                      ext = ".csv";
                  }
                  
                  const fileRes = await fetch(downloadUrl, {
                      headers: { Authorization: `Bearer ${accessToken}` }
                  });
                  if (fileRes.ok) {
                      const tmpPath = path.join(os.tmpdir(), 'gemini_upload_' + Date.now() + ext);
                      
                      const arrayBuffer = await fileRes.arrayBuffer();
                      fs.writeFileSync(tmpPath, Buffer.from(arrayBuffer));
                      
                      const upload = await ai.files.upload({ file: tmpPath, config: { mimeType: mimeType } });
                      uploadedFileUri = upload.uri;
                      uploadedFileMime = mimeType;
                      
                      fs.unlinkSync(tmpPath);
                  }
              }
          } catch (e) {
              console.error("Drive fetch error in extract-agenda:", e);
          }
      } else if (fileBase64 && mimeType) {
          uploadedFileUri = await uploadBase64ToGemini(ai, fileBase64, mimeType);
          uploadedFileMime = mimeType;
      }
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
      }
      
      let contents = [{ text: prompt }];
      if (uploadedFileUri) {
          contents = [
              { fileData: { fileUri: uploadedFileUri, mimeType: uploadedFileMime } },
              { text: prompt }
          ];
      }
      
      const response = await executeWithRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: contents }],
      }));
      
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Error in /api/gemini/extract-agenda:", error);
      res.status(500).json({ error: "Failed to extract agenda", details: error instanceof Error ? error.message : String(error) });
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

      let contents: any[] = [{ text: fullPrompt }];
      if (fileBase64 && mimeType) {
        let uri = await uploadBase64ToGemini(ai, fileBase64, mimeType);
        contents = [
          { fileData: { fileUri: uri, mimeType: mimeType } },
          { text: fullPrompt }
        ];
      }

      const response = await executeWithRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
      }));

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

      const response = await executeWithRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
      }));

      return res.json({ result: response.text });
    } catch (err) {
      console.error("Gemini Smart Recommendation Error:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });


  app.get("/api/drive-file/:fileId", async (req, res) => {
    try {
      const fileId = req.params.fileId;
      const token = req.query.token;
      
      if (!token) {
        return res.status(401).send("No token provided");
      }

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return res.status(response.status).send("Failed to fetch from Drive");
      }

      const contentType = response.headers.get("content-type");
      if (contentType) res.setHeader("Content-Type", contentType);
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (error: any) {
      console.error("Drive file fetch error:", error);
      res.status(500).send("Internal error");
    }
  });

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
  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
    import("vite").then(({ createServer }) => {
        createServer({
            server: { middlewareMode: true },
            appType: "spa",
        }).then((vite) => {
            app.use(vite.middlewares);
            app.listen(PORT, "0.0.0.0", () => {
                console.log(`Server running on http://localhost:${PORT}`);
            });
        });
    });
  } else if (process.env.VERCEL !== "1") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
  }
