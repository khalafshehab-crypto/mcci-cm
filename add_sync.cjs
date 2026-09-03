const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const printBtnRegex = /          \{\/\* Print A4 Sheet - Icon only without text \*\/\}/;

const syncBtn = `          {/* Sync to Google Tasks */}
          <button
            onClick={async () => {
              showGlobalToast("جاري مزامنة مهامك مع Google Tasks...", "loading");
              try {
                const myTasks = tasks.filter(t => t.assignedTo === currentUserName && t.status !== "منجزة" && t.status !== "مكتمل");
                for (const t of myTasks) {
                  await createGoogleTask({
                    title: t.title + " (تكليف داخلي)",
                    notes: "الوصف: " + t.description + "\\nالمسند إليه: " + t.assignedTo + "\\nملاحظات: " + (t.additionalNotes || ""),
                    due: t.dueDate ? new Date(t.dueDate).toISOString() : undefined
                  });
                }
                showGlobalToast("تم مزامنة " + myTasks.length + " مهام مع حسابك بنجاح", "success");
              } catch(e) {
                console.error(e);
                showGlobalToast("فشلت المزامنة، يرجى التأكد من صلاحيات Google Tasks", "error");
              }
            }}
            className="h-10 px-4 bg-white border border-gray-200 text-sky-600 rounded-xl hover:bg-sky-50 transition-colors flex items-center gap-2 text-xs font-black shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>مزامنة مع Google Tasks</span>
          </button>\n\n`;

code = code.replace(printBtnRegex, syncBtn + '$&');
fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
