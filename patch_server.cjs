const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
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

      const fullPrompt = \`أنت كاتب خطابات رسمية محترف في المملكة العربية السعودية (وتحديداً غرفة مكة المكرمة).
المطلوب إعداد خطاب رسمي نهائي وجاهز، بناءً على المعطيات التالية:
اللجنة: \${committeeName || "غير محدد"}
المرسل إليه: \${recipientName || "غير محدد"}
منصبه: \${recipientPosition || "غير محدد"}
الموضوع: \${subject || "غير محدد"}
تفاصيل الخطاب: \${details || "لا يوجد تفاصيل إضافية"}
ضابط الاتصال: \${contact || "لا يوجد"}
مرفقات الخطاب: \${attachments || "لا يوجد"}
الشخص الذي سيوقع الخطاب: \${signatory || "الأمين العام"}

يجب أن يكون الخطاب مصاغاً بناءً على الهيكل التالي المعتمد لدينا:
[التاريخ الهجري والميلادي يمكن تركه كمتغير مثل: التاريخ: .... / .... / ....هـ]

سعادة \${recipientName} سلمه الله
\${recipientPosition}

السلام عليكم ورحمة الله وبركاته، وبعد:

تهديكم غرفة مكة المكرمة أطيب تحية، بناءً على توصيات (\${committeeName}) ... 
[صغ محتوى الخطاب بناءً على التفاصيل المعطاة بطريقة رسمية جداً وواضحة ومقنعة]

[في حال وجود ضابط اتصال، أشر إليه للتواصل]
[في حال وجود مرفقات، أشر إليها]

شاكرين ومقدرين دعم واهتمام سعادتكم،

\${signatory}

أعد نص الخطاب فقط بدون أي شروحات إضافية وبدون استخدام markdown.\`;

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
`;

if (!code.includes('/api/gemini/generate-new-letter')) {
  code = code.replace('app.post("/api/gemini/generate-letter"', newEndpoint + '\n  app.post("/api/gemini/generate-letter"');
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts");
}
