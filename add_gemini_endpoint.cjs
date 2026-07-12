const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const endpointCode = `
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

      return res.json({ result: response.text });
    } catch (err) {
      console.error("Gemini Smart Recommendation Error:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });
`;

code = code.replace(
  '  // API health check',
  endpointCode + '\n  // API health check'
);

fs.writeFileSync('server.ts', code);
console.log("Done adding Gemini endpoint");
