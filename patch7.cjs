const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const targetStrStart = '{/* View Mode Switcher (فرز العرض: بطائق أو سجل) */}';
const targetStrEnd = '          {/* 2. Add Committee Button - Elegant Blue Accent */}';

const startIndex = code.indexOf(targetStrStart);
const endIndex = code.indexOf(targetStrEnd);

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
  const replaceStr = `{/* View Mode Switcher (فرز العرض: بطائق أو سجل) */}
          <div className="relative flex bg-white p-1 rounded-xl border border-gray-300 select-none shadow-sm gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => {
                setViewMode("cards");
                setIsColumnsOpen(false);
              }}
              className={\`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer select-none \${
                viewMode === "cards" && !isColumnsOpen
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }\`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطائق</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("table");
                setIsColumnsOpen(false);
              }}
              className={\`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer select-none \${
                viewMode === "table" && !isColumnsOpen
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }\`}
            >
              <List className="w-3.5 h-3.5" />
              <span>سجل</span>
            </button>

            {/* زر خيار الفرز مع قائمة منبثقة */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColumnsOpen(!isColumnsOpen)}
                className={\`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer select-none \${
                  isColumnsOpen
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }\`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>فرز</span>
              </button>

              <AnimatePresence>
                {isColumnsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsColumnsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3.5 space-y-3.5 text-right font-sans"
                      style={{ transformOrigin: "top left" }}
                    >
                      <div className="space-y-2 text-right">
                        <div className="flex items-center gap-1.5 text-gray-800 justify-start">
                          <span className="w-1 h-3 bg-indigo-600 rounded-full" />
                          <span className="text-[11px] font-black">أعمدة العرض:</span>
                        </div>
                        <div className="space-y-1">
                          {EXPORT_FIELDS_META.filter(f => f.key !== "alphabetical" && f.key !== "name" && f.key !== "notes" && f.key !== "desc").map((f) => (
                            <label
                              key={f.key}
                              className="flex items-center gap-2.5 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedExportFields.includes(f.key)}
                                onChange={() => toggleExportField(f.key)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-xs font-bold text-gray-700">{f.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

`;
  code = code.substring(0, startIndex) + replaceStr + code.substring(endIndex);
  fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
}
