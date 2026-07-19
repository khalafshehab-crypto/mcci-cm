const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const regexSubmit = /let token = await getSharedAccessToken\(\);\n    if \(!token\) \{[\s\S]*?\}\n    \}\n\n    if \(token\) \{/m;

const replacementSubmit = `let token = await getSharedAccessToken();
    if (!token) {
      try {
        token = await triggerAuthModal();
      } catch (err) {
        console.warn("User cancelled auth", err);
        hideGlobalToast();
        alert("لا يمكن إنشاء مجلدات العضو أو رفع المرفقات بدون تسجيل الدخول بحساب جوجل. يرجى المحاولة مرة أخرى وتأكيد المصادقة.");
        return;
      }
    }

    if (token) {`;

content = content.replace(regexSubmit, replacementSubmit);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
