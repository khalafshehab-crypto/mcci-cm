const fs = require('fs');
let serverContent = fs.readFileSync('server.ts', 'utf8');

// Replace the fallback logic for userApiKey presence checks
serverContent = serverContent.replace(
  /if \(!\(req\.body\.userApiKey \|\| process\.env\.GEMINI_API_KEY \|\| process\.env\.VITE_GEMINI_API_KEY\)\) \{[\s\S]*?return res\.status\(500\)\.json\(\{ error: "مفتاح الذكاء الاصطناعي \(GEMINI_API_KEY\) غير موجود في إعدادات Vercel\. يرجى إضافته في قسم Environment Variables\." \}\);[\s\S]*?\}/g,
  `if (!req.body.userApiKey) {
        return res.status(403).json({ error: "لا يمكن استخدام ميزات الذكاء الاصطناعي. يرجى إدخال مفتاح (BYOK) الخاص بك في 'إعدادات الحساب الشخصي' ضمن صفحة الموظفين." });
      }`
);

// Replace apiKey instantiation
serverContent = serverContent.replace(
  /apiKey: \(req\.body\.userApiKey \|\| process\.env\.GEMINI_API_KEY \|\| process\.env\.VITE_GEMINI_API_KEY\)/g,
  `apiKey: req.body.userApiKey`
);

fs.writeFileSync('server.ts', serverContent);
