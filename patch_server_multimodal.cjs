const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

const target = `  app.post("/api/gemini/reply-to-letter", async (req, res) => {
    try {
      const { incomingLetter } = req.body;
      if (!incomingLetter) {
        return res.status(400).json({ error: "Missing incomingLetter text" });
      }`;

const replacement = `  app.post("/api/gemini/reply-to-letter", async (req, res) => {
    try {
      const { incomingLetter, fileBase64, mimeType } = req.body;
      if (!incomingLetter && !fileBase64) {
        return res.status(400).json({ error: "Missing incomingLetter text or file" });
      }`;

const target2 = `      const fullPrompt = \`أنت خبير في صياغة الخطابات الرسمية في المملكة العربية السعودية.
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
      });`;

const replacement2 = `      const fullPrompt = \`أنت خبير في صياغة الخطابات الرسمية في المملكة العربية السعودية.
تم استلام الخطاب التالي:
---
\${incomingLetter || "مرفق في الملف"}
---
المطلوب:
إعداد قالب خطاب رد رسمي على هذا الخطاب الوارد (سواء كنص أو كملف مرفق).
يجب أن يحتوي القالب على متغيرات محاطة بأقواس مربعة مثل [الاسم]، [التاريخ]، [الموضوع] لكي يقوم المستخدم بتعبئتها لاحقاً.
الرد يجب أن يكون مناسباً للرد على الخطاب، وبصيغة رسمية واحترافية.
أعد نص قالب الخطاب فقط بدون أي شروحات إضافية وبدون استخدام markdown (فقط النص).\`;

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
      });`;

fs.writeFileSync('server.ts', code.replace(target, replacement).replace(target2, replacement2));
console.log("Patched server.ts with multimodal");
