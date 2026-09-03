const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const exportBtnRegex = /<button\s*onClick=\{handleExportTasks\}\s*className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs font-black shadow-sm"\s*>\s*<Download className="w-4 h-4" \/>\s*<span>تصدير<\/span>\s*<\/button>/;

const syncBtn = `<button
            onClick={async () => {
              showGlobalToast("جاري مزامنة مهامك مع Google Tasks...", "loading");
              try {
                const myTasks = tasks.filter(t => t.assignedTo === currentUserName && t.status !== "منجزة" && t.status !== "مكتمل");
                for (const t of myTasks) {
                  await createGoogleTask({
                    title: t.title + " (مزامنة)",
                    notes: "الوصف: " + t.description + "\\nالتفاصيل: " + (t.additionalNotes || ""),
                    due: t.dueDate ? new Date(t.dueDate).toISOString() : undefined
                  });
                }
                showGlobalToast("تم مزامنة " + myTasks.length + " مهام مع حسابك بنجاح", "success");
              } catch(e) {
                console.error(e);
                showGlobalToast("فشلت المزامنة، يرجى التأكد من صلاحيات Google Tasks", "error");
              }
            }}
            className="px-3 py-2 bg-white border border-gray-200 text-sky-600 rounded-xl hover:bg-sky-50 transition-colors flex items-center gap-2 text-xs font-black shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>مزامنة المهام (Google Tasks)</span>
          </button>`;

code = code.replace(exportBtnRegex, syncBtn + '\n          ' + '$&');

if (!code.includes("RefreshCw")) {
  code = code.replace(/import \{.*?\} from 'lucide-react';/, (match) => {
    return match.replace("}", ", RefreshCw }");
  });
}

fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
