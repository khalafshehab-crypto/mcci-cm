const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = ['Events.tsx', 'CommitteesEvents.tsx', 'CentersEvents.tsx', 'AffiliatesEvents.tsx', 'AssistantSecGenEvents.tsx']
  .map(file => path.join(srcDir, file));

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // We want to pass the error message from stats.
  // Wait, stats currently only has `failed`, `created`, `updated`.
  // I'll just change the toast string to not explicitly blame authentication.
  
  const oldToastUpdate = /showGlobalToast\("تم تحديث الفعالية في النظام، لكن فشلت المزامنة مع جوجل\. يرجى تجديد التوثيق\.", "error"\);/g;
  content = content.replace(oldToastUpdate, 'showGlobalToast("تم تحديث الفعالية في النظام، لكن فشلت المزامنة مع جوجل (قد يكون بسبب تكرار إيميلات المدعوين أو خطأ في صيغة الوقت).", "error");');

  const oldToastCreate = /showGlobalToast\("تم إنشاء الفعالية في النظام، لكن فشلت المزامنة مع جوجل\. يرجى تجديد التوثيق\.", "error"\);/g;
  content = content.replace(oldToastCreate, 'showGlobalToast("تم إنشاء الفعالية في النظام، لكن فشلت المزامنة مع جوجل (قد يكون بسبب تكرار إيميلات المدعوين أو خطأ في صيغة الوقت).", "error");');

  fs.writeFileSync(file, content);
  console.log("Fixed toast in", path.basename(file));
});
