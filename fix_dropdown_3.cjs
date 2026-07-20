const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// First replace the state
const stateRegex = /const \[isExportOpen, setIsExportOpen\] = useState\(false\);/;
if (code.match(stateRegex)) {
  code = code.replace(stateRegex, `const [isExportOpen, setIsExportOpen] = useState(false);\n  const [exportModalMode, setExportModalMode] = useState<'import' | 'export'>('export');`);
}

// Then replace the dropdown
const dropdownRegex = /<button\s*type="button"\s*onClick=\{\(\) => \{\s*setIsAddMenuOpen\(false\);\s*setIsExportOpen\(true\);\s*\}\}\s*className="w-full h-10 px-3 bg-white hover:bg-emerald-50 text-gray-800 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-right group"\s*>\s*<div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100">\s*<FileSpreadsheet className="w-3\.5 h-3\.5" \/>\s*<\/div>\s*<span>استيراد \/ تصدير<\/span>\s*<\/button>/;

const newDropdown = `<button
                      type="button"
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setExportModalMode('import');
                        setIsExportOpen(true);
                      }}
                      className="w-full h-10 px-3 bg-white hover:bg-blue-50 text-gray-800 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-right group"
                    >
                      <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100">
                        <Upload className="w-3.5 h-3.5" />
                      </div>
                      <span>استيراد</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        setExportModalMode('export');
                        setIsExportOpen(true);
                      }}
                      className="w-full h-10 px-3 bg-white hover:bg-emerald-50 text-gray-800 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-right group"
                    >
                      <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                      <span>تصدير</span>
                    </button>`;

code = code.replace(dropdownRegex, newDropdown);

// Replace the word "إضافة لجنة جديدة" in the dropdown to "إضافة لجنة"
code = code.replace(/<span>إضافة لجنة جديدة<\/span>/, '<span>إضافة لجنة</span>');

// Then update the modal body and footer based on exportModalMode
const modalHeaderRegex = /<h3 className="font-extrabold text-gray-900 text-base leading-tight">\s*استيراد وتصدير اللجان \(Google Sheets\)\s*<\/h3>\s*<p className="text-xs text-gray-500 font-bold mt-0\.5">اختر الحقول والبيانات المراد استيرادها أو تصديرها<\/p>/;
const newModalHeader = `<h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      {exportModalMode === 'export' ? 'تصدير اللجان (Google Sheets)' : 'استيراد اللجان (CSV)'}
                    </h3>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">
                      {exportModalMode === 'export' ? 'اختر الحقول والبيانات المراد تصديرها' : 'اختر الحقول والبيانات المراد استيرادها'}
                    </p>`;
code = code.replace(modalHeaderRegex, newModalHeader);

const modalDescRegex = /سيتم فرز وتصدير اللجان المحددة أبجدياً مع جلب كافة الإحصائيات الفعالة تلقائياً\. للاستيراد، يرجى اختيار ملف CSV مطابق للأعمدة المحددة\./;
const newModalDesc = `{exportModalMode === 'export' ? 'سيتم فرز وتصدير اللجان المحددة أبجدياً مع جلب كافة الإحصائيات الفعالة تلقائياً.' : 'للاستيراد، يرجى اختيار ملف CSV مطابق للأعمدة المحددة.'}`;
code = code.replace(modalDescRegex, newModalDesc);

const modalFieldsTitleRegex = /تحديد الحقول المراد استيرادها\/تصديرها:/;
const newModalFieldsTitle = `{exportModalMode === 'export' ? 'تحديد الحقول المراد تصديرها:' : 'تحديد الحقول المراد استيرادها:'}`;
code = code.replace(modalFieldsTitleRegex, newModalFieldsTitle);

const modalFooterRegex = /<div className="p-6 border-t border-gray-100 bg-gray-50\/50 flex flex-wrap gap-3">\s*<button\s*type="button"\s*onClick=\{handleExportToGoogleSheets\}\s*className="flex-1 min-w-\[140px\] h-11 bg-emerald-600 hover:bg-emerald-700 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1\.5 transition-all cursor-pointer"\s*>\s*<Download className="w-4 h-4" \/>\s*<span>تصدير إلى Sheets<\/span>\s*<\/button>\s*<label className="flex-1 min-w-\[140px\] h-11 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1\.5 transition-all cursor-pointer">\s*<Upload className="w-4 h-4" \/>\s*<span>استيراد ملف CSV<\/span>\s*<input\s*type="file"\s*accept="\.csv"\s*className="hidden"\s*onChange=\{handleImportCSV\}\s*\/>\s*<\/label>\s*<\/div>/;
const newModalFooter = `<div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
                {exportModalMode === 'export' ? (
                  <button
                    type="button"
                    onClick={handleExportToGoogleSheets}
                    className="flex-1 min-w-[140px] h-11 bg-emerald-600 hover:bg-emerald-700 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير إلى Sheets</span>
                  </button>
                ) : (
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
                )}
              </div>`;
code = code.replace(modalFooterRegex, newModalFooter);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
console.log("Updated dropdown and modal successfully!");
