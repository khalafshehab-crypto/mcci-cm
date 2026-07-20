const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const modals = `
      {/* 📥 EXPORT/IMPORT MODAL */}
      <AnimatePresence>
        {isExportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExportOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    {exportModalMode === 'export' ? <Upload className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      {exportModalMode === 'export' ? 'تصدير بيانات الأعضاء' : 'استيراد بيانات الأعضاء (CSV)'}
                    </h3>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">
                      {exportModalMode === 'export' ? 'اختر الحقول والبيانات المراد تصديرها' : 'اختر الحقول والبيانات المراد استيرادها'}
                    </p>
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
                  {exportModalMode === 'export' ? 'سيتم فرز وتصدير الأعضاء المحددة أبجدياً.' : 'للاستيراد، يرجى اختيار ملف CSV مطابق للأعمدة المحددة.'}
                </p>
                <div className="space-y-2">
                  <span className="block text-xs font-black text-gray-700">{exportModalMode === 'export' ? 'تحديد الحقول المراد تصديرها:' : 'تحديد الحقول المراد استيرادها:'}</span>
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
                {exportModalMode === 'export' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleExportToGoogleSheets}
                      className="flex-1 min-w-[140px] h-11 bg-emerald-600 hover:bg-emerald-700 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>تصدير إلى CSV</span>
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📊 CSV IMPORT PREVIEW MODAL */}
      <AnimatePresence>
        {importPreviewOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setImportPreviewOpen(false)}
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      معاينة بيانات الأعضاء (CSV)
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">اختر الأعضاء المراد استيرادها</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setImportPreviewOpen(false)}
                  className="p-2 hover:bg-gray-200/50 text-gray-500 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-bold flex gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    تم قراءة الملف بنجاح! وجدنا {importedMembers.length} عضواً صالحاً.
                    <br />
                    يرجى مراجعة وتأكيد اختيار الأعضاء للاستيراد.
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                        <tr>
                          <th className="p-3 font-black text-gray-600 whitespace-nowrap w-10 text-center">
                            <input 
                              type="checkbox"
                              checked={importedMembers.every(m => m.selected)}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setImportedMembers(prev => prev.map(m => ({...m, selected: val})));
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                          </th>
                          <th className="p-3 font-black text-gray-600 whitespace-nowrap">الاسم</th>
                          <th className="p-3 font-black text-gray-600 whitespace-nowrap">اللجنة</th>
                          <th className="p-3 font-black text-gray-600 whitespace-nowrap">رقم الجوال</th>
                          <th className="p-3 font-black text-gray-600 whitespace-nowrap">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importedMembers.map((item, i) => (
                          <tr key={i} className={\`border-b border-gray-100 hover:bg-gray-50 transition-colors \${item.isDuplicate ? 'bg-orange-50/30' : ''}\`}>
                            <td className="p-3 text-center">
                              <input 
                                type="checkbox"
                                checked={item.selected}
                                onChange={(e) => {
                                  const val = e.target.checked;
                                  setImportedMembers(prev => prev.map((m, idx) => idx === i ? {...m, selected: val} : m));
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                              />
                            </td>
                            <td className="p-3 font-bold text-gray-900 whitespace-nowrap">{item.member.name}</td>
                            <td className="p-3 text-gray-700 whitespace-nowrap">{item.member.committeeName}</td>
                            <td className="p-3 text-gray-700 whitespace-nowrap" dir="ltr">{item.member.phone}</td>
                            <td className="p-3 whitespace-nowrap">
                              {item.isDuplicate ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-orange-100 text-orange-700">
                                  <AlertTriangle className="w-3 h-3" />
                                  مسجل مسبقاً
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700">
                                  جديد
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={confirmCSVImport}
                  disabled={!importedMembers.some(m => m.selected)}
                  className="flex-1 min-w-[140px] h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تأكيد الاستيراد ({importedMembers.filter(m => m.selected).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportPreviewOpen(false)}
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

if (!code.includes('CSV IMPORT PREVIEW MODAL')) {
  // Find the last occurrence of </AnimatePresence>
  const lastIndex = code.lastIndexOf('</AnimatePresence>');
  if (lastIndex !== -1) {
    code = code.slice(0, lastIndex + 18) + '\n' + modals + '\n' + code.slice(lastIndex + 18);
    fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
    console.log("Added modals correctly");
  } else {
    console.log("Could not find AnimatePresence");
  }
} else {
  console.log("Modals already added");
}
