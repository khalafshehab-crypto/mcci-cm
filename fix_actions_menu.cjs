const fs = require('fs');

const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  if (!code.includes('isActionsMenuOpen')) {
    // Add state
    code = code.replace(/const \[isSyncing, setIsSyncing\] = useState\(false\);/, 
      `const [isSyncing, setIsSyncing] = useState(false);\n  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);`);
  }

  // Find the exact buttons we added earlier
  const oldButtonsRegex = /<button\n\s*type="button"\n\s*onClick=\{handleManualSync\}[^>]*>[\s\S]*?<\/button>\n\s*<button\n\s*type="button"\n\s*onClick=\{handleOpenAdd\}[^>]*>[\s\S]*?<\/button>/;

  const newMenu = `<div className="relative">
            <button
              type="button"
              onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>إجراءات الفعاليات</span>
              <ChevronDown className="w-4 h-4 mr-1 stroke-[2.5]" />
            </button>

            {isActionsMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsActionsMenuOpen(false)}
                />
                <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  <button
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      handleOpenAdd();
                    }}
                    className="w-full px-4 py-2.5 text-right text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-gray-500 stroke-[2.5]" />
                    <span>إضافة فعالية</span>
                  </button>
                  <div className="h-px w-full bg-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      handleManualSync();
                    }}
                    disabled={isSyncing}
                    className="w-full px-4 py-2.5 text-right text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={\`w-4 h-4 text-gray-500 stroke-[2.5] \${isSyncing ? 'animate-spin' : ''}\`} />
                    <span>مزامنة التقويم</span>
                  </button>
                </div>
              </>
            )}
          </div>`;

  if (oldButtonsRegex.test(code)) {
    code = code.replace(oldButtonsRegex, newMenu);
    fs.writeFileSync(file, code);
    console.log("Updated", file);
  } else {
    console.log("Could not find old buttons in", file);
  }
}
