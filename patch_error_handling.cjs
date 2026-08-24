const fs = require('fs');

let serverContent = fs.readFileSync('server.ts', 'utf8');
serverContent = serverContent.replace(
  /res\.status\(500\)\.json\(\{ error: "Failed to generate text\." \}\);/g,
  `res.status(500).json({ error: "خطأ في توليد الذكاء الاصطناعي: " + (e.message || "فشل التوليد") });`
);
fs.writeFileSync('server.ts', serverContent);

let libContent = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');
libContent = libContent.replace(
  /alert\("حدث خطأ أثناء التوليد الذكي"\);/g,
  `const errData = await response.json().catch(() => ({})); alert(errData.error || "حدث خطأ أثناء التوليد الذكي");`
);
fs.writeFileSync('src/pages/CommitteesLibrary.tsx', libContent);

