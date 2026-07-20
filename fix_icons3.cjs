const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const targetStr = `              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleExportToGoogleSheets}
                  className="flex-1 min-w-[140px] h-11 bg-emerald-600 hover:bg-emerald-700 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير إلى Sheets</span>
                </button>
                
                <label className="flex-1 min-w-[140px] h-11 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>استيراد ملف CSV</span>
                  <input 
                    type="file" 
                    accept=".csv"
                    className="hidden" 
                    onChange={handleImportCSV}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(false)}
                  className="px-5 h-11 bg-gray-200 hover:bg-gray-300 text-gray-750 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>`;

const newFooter = `              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
                {exportModalMode === 'export' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleExportToGoogleSheets}
                      className="flex-1 min-w-[140px] h-11 bg-emerald-600 hover:bg-emerald-700 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>تصدير إلى Sheets</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsExportOpen(false)}
                      className="px-5 h-11 bg-gray-200 hover:bg-gray-300 text-gray-750 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    <label className="flex-1 min-w-[140px] h-11 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                      <Download className="w-4 h-4" />
                      <span>استيراد ملف CSV</span>
                      <input 
                        type="file" 
                        accept=".csv"
                        className="hidden" 
                        onChange={handleImportCSV}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsExportOpen(false)}
                      className="px-5 h-11 bg-gray-200 hover:bg-gray-300 text-gray-750 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </>
                )}
              </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newFooter);
  fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
  console.log("Replaced footer successfully!");
} else {
  console.log("Footer string not found!");
}

