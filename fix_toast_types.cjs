const fs = require('fs');

const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace "info" with "loading" for the loading state
  code = code.replace(/showGlobalToast\("جاري مزامنة التقويم، يرجى الانتظار\.\.\.", "info"\);/g, 'showGlobalToast("جاري مزامنة التقويم، يرجى الانتظار...", "loading");');
  
  // Replace "info" with "success" for the "no events" state
  code = code.replace(/showGlobalToast\("لا توجد مواعيد جديدة للمزامنة\.", "info"\);/g, 'showGlobalToast("لا توجد مواعيد جديدة للمزامنة.", "success");');

  fs.writeFileSync(file, code);
  console.log("Fixed toast types in", file);
}
