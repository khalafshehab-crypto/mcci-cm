const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = ['Events.tsx', 'CommitteesEvents.tsx', 'CentersEvents.tsx', 'AffiliatesEvents.tsx', 'AssistantSecGenEvents.tsx']
  .map(file => path.join(srcDir, file));

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Find the try-catch for syncEventsToCalendar and replace it
  const match = content.match(/syncEventsToCalendar\(\[[^\]]+\],\s*dbEmployees,\s*"[^"]+"\);[\s\n]*showGlobalToast\("([^"]+)"/g);
  
  if (match) {
     // I need to properly update the callers.
     // Let's do it using a regex replace.
     content = content.replace(
       /await syncEventsToCalendar\(\[updatedEvent\], dbEmployees, "(.*?)"\);\s*showGlobalToast\("(.*?)", "success"\);/g,
       `const stats = await syncEventsToCalendar([updatedEvent], dbEmployees, "$1");
      if (stats.failed > 0) {
        showGlobalToast("تم تحديث الفعالية في النظام، لكن فشلت المزامنة مع جوجل. يرجى تجديد التوثيق.", "error");
      } else {
        showGlobalToast("$2", "success");
      }`
     );
     content = content.replace(
       /await syncEventsToCalendar\(\[newEvent\], dbEmployees, "(.*?)"\);\s*showGlobalToast\("(.*?)", "success"\);/g,
       `const stats = await syncEventsToCalendar([newEvent], dbEmployees, "$1");
      if (stats.failed > 0) {
        showGlobalToast("تم إنشاء الفعالية في النظام، لكن فشلت المزامنة مع جوجل. يرجى تجديد التوثيق.", "error");
      } else {
        showGlobalToast("$2", "success");
      }`
     );
     
     content = content.replace(
       /await syncEventsToCalendar\(newEventsList, dbEmployees, "(.*?)"\);\s*showGlobalToast\("(.*?)", "success"\);/g,
       `const stats = await syncEventsToCalendar(newEventsList, dbEmployees, "$1");
      if (stats.failed > 0) {
        showGlobalToast("تم الحفظ في النظام، لكن فشلت مزامنة بعض الفعاليات مع جوجل.", "error");
      } else {
        showGlobalToast("$2", "success");
      }`
     );
  }
  
  fs.writeFileSync(file, content);
  console.log("Updated error handling in", file);
});
