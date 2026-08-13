const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /showGlobalToast\("لم نتمكن من تنزيل الملف من الرابط، تأكد من الصلاحيات", "error"\);/,
    'showGlobalToast("خطأ: " + (e as Error).message, "error");'
  );
  fs.writeFileSync(file, content);
}
console.log('Patched toast');
