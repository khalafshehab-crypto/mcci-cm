const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf8');

const oldBtn = `                      <button
                        onClick={handleAutoScanAndPopulateKPIs}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-white text-gray-750 hover:bg-gray-100 rounded-lg text-xs font-extrabold transition-colors border border-gray-300 shadow-sm"
                        title="تصدير شيت المؤشر"
                      >
                        تسكين
                        <Download className="w-3 h-3" />
                      </button>`;
const newBtn = `                      <button
                        onClick={handleAutoScanAndPopulateKPIs}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-white text-gray-750 hover:bg-gray-100 rounded-lg text-xs font-extrabold transition-colors border border-gray-300 shadow-sm"
                        title="تصدير شيت المؤشر"
                      >
                        تحميل
                        <Download className="w-3 h-3" />
                      </button>`;
code = code.replace(oldBtn, newBtn);
fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
