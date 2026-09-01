const fs = require('fs');
const path = 'server.ts';
let code = fs.readFileSync(path, 'utf8');

const newEndpoint = `
  app.post("/api/gemini/summarize-minutes", async (req, res) => {
    try {
      const { text, userApiKey } = req.body;
      if (!text) return res.status(400).json({ error: "Missing text" });
      if (!userApiKey) {
        return res.status(403).json({ error: "لا يمكن استخدام ميزات الذكاء الاصطناعي. يرجى إدخال مفتاح (BYOK) الخاص بك في 'إعدادات الحساب الشخصي' ضمن صفحة الموظفين." });
      }

      const ai = new GoogleGenAI({
        apiKey: userApiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const fullPrompt = \`
أنت سكرتير تنفيذي خبير في صياغة محاضر الاجتماعات الرسمية.
قم بتلخيص وتنسيق مسودة محضر الاجتماع التالية. 
النتيجة يجب أن تكون بتنسيق JSON حصراً يحتوي على المصفوفات التالية بدون أي نصوص إضافية قبل أو بعد:
{
  "summary": "نص التلخيص الرسمي والمحسن لغوياً لما تم مناقشته",
  "recommendations": [
    { "text": "نص التوصية الأولى", "assignedTo": "اسم الجهة أو الشخص المنفذ", "duration": "المدة المقترحة للتنفيذ" }
  ],
  "tasks": [
    { "title": "عنوان المهمة الأولى", "assignedTo": "المسؤول", "dueDate": "تاريخ تقريبي مثل: الأسبوع القادم" }
  ]
}

المسودة:
\${text}
\`;

      const response = await executeWithFallback((modelName) => ai.models.generateContent({ 
        model: modelName,
        contents: { parts: [{ text: fullPrompt }] },
      }));
      
      let rawText = response.text;
      // Strip markdown code blocks if any
      rawText = rawText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      
      return res.json({ result: JSON.parse(rawText) });
    } catch (err) {
      console.error("Gemini Summarize Minutes Error:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });
`;

if (!code.includes('/api/gemini/summarize-minutes')) {
  code = code.replace(
    'app.post("/api/gemini/smart-recommendation"',
    newEndpoint + '\n  app.post("/api/gemini/smart-recommendation"'
  );
  fs.writeFileSync(path, code);
  console.log("Patched server.ts with /api/gemini/summarize-minutes");
}
