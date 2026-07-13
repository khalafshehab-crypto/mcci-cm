const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// The export button is currently directly calling handleExportToGoogleSheets
code = code.replace(
  `onClick={handleExportToGoogleSheets}`,
  `onClick={() => setIsExportOpen(true)}`
);

// We also need to change the button text
code = code.replace(
  `<span>تصدير لجداول Google Sheets</span>`,
  `<span>استيراد وتصدير Google Sheets</span>`
);
code = code.replace(
  `title="تصدير كافة اللجان الحالية لجداول Google Sheets"`,
  `title="استيراد أو تصدير اللجان لجداول Google Sheets"`
);


// Now we add the modal back before the final </AnimatePresence> or at the end of the return statement.
// Since the file might be tricky to match, let's append it right before the last closing tags.
// Let's find the last </div>
const modalCode = `
      {/* 📊 GOOGLE SHEETS DYNAMIC EXPORT MODAL */}
      <AnimatePresence>
        {isExportOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExportOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right text-slate-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      استيراد وتصدير اللجان (Google Sheets)
                    </h3>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">اختر الحقول والبيانات المراد استيرادها أو تصديرها</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(false)}
                  className="p-1.5 hover:bg-gray-200/50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-xs font-semibold text-gray-650 leading-relaxed bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100">
                  سيتم فرز وتصدير اللجان المحددة أبجدياً مع جلب كافة الإحصائيات الفعالة تلقائياً. للاستيراد، يرجى اختيار ملف CSV مطابق للأعمدة المحددة.
                </p>

                <div className="space-y-2">
                  <span className="block text-xs font-black text-gray-700">تحديد الحقول المراد استيرادها/تصديرها:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/50">
                    {EXPORT_FIELDS_META.map(f => (
                      <label 
                        key={f.key} 
                        className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-gray-150 hover:border-emerald-300 transition-colors cursor-pointer select-none"
                      >
                        <input 
                          type="checkbox"
                          checked={selectedExportFields.includes(f.key)}
                          onChange={() => toggleExportField(f.key)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span className="text-xs font-extrabold text-gray-800">{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
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
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        alert("عذراً، ميزة الاستيراد قيد التطوير وسيتم تفعيلها قريباً.");
                      }
                    }} 
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setIsExportOpen(false)}
                  className="px-5 h-11 bg-gray-200 hover:bg-gray-300 text-gray-750 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

// Insert the modal code just before the final </div>
const finalDivIndex = code.lastIndexOf('</div>');
if (finalDivIndex !== -1) {
  code = code.substring(0, finalDivIndex) + modalCode + code.substring(finalDivIndex);
}

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
