const fs = require('fs');
const path = 'src/pages/CommitteesRecommendations.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('logSystemAction')) {
  code = code.replace(
    'import { addDoc, collection, updateDoc, doc, deleteDoc } from "firebase/firestore";',
    'import { addDoc, collection, updateDoc, doc, deleteDoc } from "firebase/firestore";\nimport { logSystemAction } from "../lib/audit";'
  );

  // Add Rec
  code = code.replace(
    'showGlobalToast("تم إنشاء التوصية بنجاح", "success");',
    'showGlobalToast("تم إنشاء التوصية بنجاح", "success");\n      await logSystemAction("مستخدم", "إنشاء", "التوصيات", `إنشاء توصية جديدة: ${newRec.title || "بدون عنوان"}`);'
  );
  
  // Delete Rec
  code = code.replace(
    'showGlobalToast("تم حذف التوصية", "success");',
    'showGlobalToast("تم حذف التوصية", "success");\n      await logSystemAction("مستخدم", "حذف", "التوصيات", `حذف التوصية`);'
  );

  fs.writeFileSync(path, code);
  console.log("Patched CommitteesRecommendations.tsx for logging");
}
