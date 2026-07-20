const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const regex = /\{\/\* 2\. Add Committee Button - Elegant Blue Accent \*\/\}[\s\S]*?<span>استيراد \/ تصدير<\/span>\s*<\/button>/;

const replacement = `{/* Merged Add/Import/Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>إجراءات اللجان</span>
              <ChevronDown className="w-4 h-4 mr-1 opacity-70" />
            </button>
            <AnimatePresence>
              {isAddMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-10"
                    onClick={() => setIsAddMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-20 flex flex-col gap-1"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        handleOpenAdd();
                      }}
                      className="w-full h-10 px-3 bg-white hover:bg-blue-50 text-gray-800 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-right group"
                    >
                      <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <span>إضافة لجنة جديدة</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setIsExportOpen(true);
                      }}
                      className="w-full h-10 px-3 bg-white hover:bg-emerald-50 text-gray-800 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-right group"
                    >
                      <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </div>
                      <span>استيراد / تصدير</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
  console.log("Dropdown added successfully!");
} else {
  console.log("Regex not found!");
}
