const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

if (!code.includes("import { createGoogleTask }")) {
  code = code.replace(/import \{ showGlobalToast \} from '\.\.\/lib\/toastUtils';/, `import { showGlobalToast } from '../lib/toastUtils';\nimport { createGoogleTask } from '../lib/googleApi';`);
}

const addRegex = /      await addDoc\(collection\(db, "tasks"\), newTask\);\n      setIsAddOpen\(false\);/;
const newAdd = `      await addDoc(collection(db, "tasks"), newTask);
      
      // Sync to Google Tasks
      try {
        await createGoogleTask({
          title: \`\${title} (تكليف داخلي)\`,
          notes: \`الوصف: \${description}\\nالمسند إليه: \${assignedTo}\\nملاحظات: \${additionalNotes}\`,
          due: dueDate ? new Date(dueDate).toISOString() : undefined
        });
        showGlobalToast("تم إنشاء المهمة ومزامنتها مع Google Tasks", "success");
      } catch (err) {
        console.warn("Failed to sync with Google Tasks", err);
        showGlobalToast("تم الحفظ في النظام، ولكن فشلت المزامنة مع Google Tasks", "info");
      }

      setIsAddOpen(false);`;
code = code.replace(addRegex, newAdd);
fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
