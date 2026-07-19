const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf8');

const regex = /let token = await getSharedAccessToken\(\);\n      if \(!token\) \{\n        try \{\n          token = await triggerAuthModal\(\);\n        \} catch \(err\) \{\n          console\.warn\("User cancelled auth", err\);\n        \}\n      \}/m;

const replacement = `let token = await getSharedAccessToken();
      if (!token) {
        try {
          token = await triggerAuthModal();
        } catch (err) {
          console.warn("User cancelled auth", err);
          showGlobalToast("لا يمكن حفظ التوصية بدون المصادقة. يرجى تسجيل الدخول إلى جوجل درايف أولاً.", "error");
          return null;
        }
      }`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', content);
