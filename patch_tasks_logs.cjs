const fs = require('fs');
const path = 'src/pages/CommitteesTasks.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('logSystemAction')) {
  code = code.replace(
    'import { addDoc, collection, updateDoc, doc, deleteDoc } from "firebase/firestore";',
    'import { addDoc, collection, updateDoc, doc, deleteDoc } from "firebase/firestore";\nimport { logSystemAction } from "../lib/audit";'
  );

  // Add task
  code = code.replace(
    'showGlobalToast("تم إنشاء المهمة بنجاح", "success");',
    'showGlobalToast("تم إنشاء المهمة بنجاح", "success");\n      await logSystemAction(currentUser?.name || "مستخدم", "إنشاء", "المهام", `إنشاء مهمة جديدة: ${newTask.title}`);'
  );
  
  // Delete task
  code = code.replace(
    'showGlobalToast("تم حذف المهمة", "success");',
    'showGlobalToast("تم حذف المهمة", "success");\n      await logSystemAction(currentUser?.name || "مستخدم", "حذف", "المهام", `حذف مهمة: ${taskToDelete.title}`);'
  );

  fs.writeFileSync(path, code);
  console.log("Patched CommitteesTasks.tsx for logging");
}
