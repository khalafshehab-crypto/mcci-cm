const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const regex = /<\/AnimatePresence>\n<\/div>\n  \);\n}/;

const replacement = `</AnimatePresence>

      {/* 📊 GOOGLE SHEETS IMPORT PREVIEW MODAL */}
      <AnimatePresence>
        {importPreviewOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImportPreviewOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right text-slate-800 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      معاينة لجان الاستيراد
                    </h3>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">
                      الرجاء مراجعة اللجان المستخرجة من الملف قبل تأكيد إضافتها
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setImportPreviewOpen(false)}
                  className="p-1.5 hover:bg-gray-200/50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-xs font-bold border border-amber-200">
                  <p>اللجان المتعارضة تظهر بلون باهت وغير محددة لتجنب الازدواجية.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {importedCommittees.map((item, index) => (
                    <label
                      key={index}
                      className={\`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer \${
                        item.isDuplicate
                          ? "bg-gray-50 border-gray-200 opacity-60"
                          : item.selected
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200 hover:border-blue-300"
                      }\`}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        disabled={item.isDuplicate}
                        onChange={(e) => {
                          const newArr = [...importedCommittees];
                          newArr[index].selected = e.target.checked;
                          setImportedCommittees(newArr);
                        }}
                        className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <p className="font-extrabold text-gray-900 text-sm mb-1">{item.comm.name}</p>
                        <p className="text-gray-500 font-medium">الرئيس: {item.comm.president} | الأخصائي: {item.comm.specialist}</p>
                        {item.isDuplicate && (
                          <p className="text-red-600 mt-2 font-bold flex items-center gap-1">
                            <TriangleAlert className="w-3.5 h-3.5" /> مسجلة مسبقاً في النظام
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setImportPreviewOpen(false)}
                  className="px-5 h-11 bg-gray-200 hover:bg-gray-300 text-gray-750 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmImport}
                  disabled={!importedCommittees.some(c => c.selected)}
                  className="px-6 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد استيراد ({importedCommittees.filter(c => c.selected).length}) لجنة</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
</div>
  );
}`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
  console.log("Replaced successfully with regex 3!");
} else {
  console.log("Regex not found!");
}
