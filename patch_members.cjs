const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// Add import for toastUtils
content = content.replace(
  'import { getSharedAccessToken, triggerAuthModal, getOrCreateFolder, uploadBinaryFileToDrive } from "../lib/googleApi";',
  'import { getSharedAccessToken, triggerAuthModal, getOrCreateFolder, uploadBinaryFileToDrive } from "../lib/googleApi";\nimport { showGlobalToast, clearGlobalToast } from "../lib/toastUtils";'
);

// Replace handleSave logic to include global toast
content = content.replace(
  /let token = await getSharedAccessToken\(\);/g,
  `showGlobalToast("جاري المعالجة والرفع إلى السحابة المركزية...", "loading", 0);\n    let token = await getSharedAccessToken();`
);

content = content.replace(
  /alert\("فشل إنشاء أو رفع الملفات في جوجل درايف: " \+ err\.message\);/g,
  `showGlobalToast("فشل إنشاء أو رفع الملفات في جوجل درايف: " + err.message, "error");`
);

content = content.replace(
  /alert\(err\.message\);/g,
  `showGlobalToast(err.message, "error");`
);

content = content.replace(
  /setIsAddOpen\(false\);/g,
  `setIsAddOpen(false);\n      showGlobalToast("تم حفظ وتحديث البيانات بنجاح!", "success");`
);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
