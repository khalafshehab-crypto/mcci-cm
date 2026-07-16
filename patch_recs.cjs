const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf8');

// Add import
content = content.replace(
  'import { getSharedAccessToken, getOrCreateFolder, uploadBinaryFileToDrive, triggerAuthModal } from "../lib/googleApi";',
  'import { getSharedAccessToken, getOrCreateFolder, uploadBinaryFileToDrive, triggerAuthModal } from "../lib/googleApi";\nimport { showGlobalToast, clearGlobalToast } from "../lib/toastUtils";'
);

// Replace setAlertState with showGlobalToast for uploads
content = content.replace(
  /setAlertState\(\{ isOpen: true, message: "جاري الرفع والمزامنة مع أرشيف جوجل درايف\.\.\.", onClose: \(\) => \{\} \}\);/g,
  `showGlobalToast("جاري الرفع والمزامنة مع أرشيف جوجل درايف...", "loading", 0);`
);

content = content.replace(
  /setAlertState\(\{ isOpen: true, message: "تمت المزامنة وحفظ الملفات بنجاح في أرشيف جوجل درايف\.", onClose: \(\) => \{\} \}\);/g,
  `showGlobalToast("تمت المزامنة وحفظ الملفات بنجاح في أرشيف جوجل درايف.", "success");`
);

content = content.replace(
  /setAlertState\(\{ isOpen: true, message: msg, onClose: \(\) => \{\} \}\);/g,
  `showGlobalToast(msg, "error");`
);

fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', content);
