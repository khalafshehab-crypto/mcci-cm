const fs = require('fs');

let libContent = fs.readFileSync('src/pages/Library.tsx', 'utf8');

libContent = libContent.replace(
  /body: JSON\.stringify\(\{/,
  `body: JSON.stringify({ userApiKey: localStorage.getItem('BYOK_GEMINI_API_KEY') || undefined,`
);

libContent = libContent.replace(
  /alert\("عذراً، الخادم يواجه ضغطاً حالياً\. الرجاء المحاولة مرة أخرى\.\\n" \+ \(errData\?\.error \|\| ""\)\);/g,
  `alert(errData?.error || "حدث خطأ أثناء التوليد الذكي.");`
);

fs.writeFileSync('src/pages/Library.tsx', libContent);

