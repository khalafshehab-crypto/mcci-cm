const fs = require('fs');

const code = fs.readFileSync('server.ts', 'utf8');

const target = `    } catch (err) {
      console.error("Gemini Generate Letter Error:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });`;

const replacement = `    } catch (err: any) {
      console.error("Gemini Generate Letter Error:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });

  app.post("/api/gemini/reply-to-letter", async (req, res) => {
    try {
      const { incomingLetter } = req.body;
      if (!incomingLetter) {
        return res.status(400).json({ error: "Missing incomingLetter text" });
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

      const fullPrompt = \`أنت خبير في صياغة الخطابات الرسمية في المملكة العربية السعودية.
تم استلام الخطاب التالي:
---
\${incomingLetter}
---
المطلوب:
إعداد قالب خطاب رد رسمي على هذا الخطاب.
يجب أن يحتوي القالب على متغيرات محاطة بأقواس مربعة مثل [الاسم]، [التاريخ]، [الموضوع] لكي يقوم المستخدم بتعبئتها لاحقاً.
الرد يجب أن يكون مناسباً للرد على الخطاب الوارد أعلاه، وبصيغة رسمية واحترافية.
أعد نص قالب الخطاب فقط بدون أي شروحات إضافية وبدون استخدام markdown (فقط النص).\`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
      });

      return res.json({ result: response.text });
    } catch (err: any) {
      console.error("Gemini Reply to Letter Error:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });`;

fs.writeFileSync('server.ts', code.replace(target, replacement));
console.log("Patched server.ts");
