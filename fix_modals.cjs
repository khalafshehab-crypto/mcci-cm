const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// The replacement UI
const replacementModals = `
      {/* 📥 EXPORT MODAL */}
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
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">تصدير بيانات الأعضاء</h3>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">اختر الحقول المراد تصديرها</p>
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

              <div className="p-6 space-y-4">
                <p className="text-xs font-semibold text-gray-650 leading-relaxed bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100">
                  سيتم فرز وتصدير الأعضاء المحددة أبجدياً.
                </p>
                <div className="space-y-2">
                  <span className="block text-xs font-black text-gray-700">تحديد الحقول المراد تصديرها:</span>
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

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📥 IMPORT MODAL */}
      <AnimatePresence>
        {isImportOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={closeImportModal}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">استيراد الأعضاء من ملف</h3>
                    <p className="text-xs text-gray-500 font-medium">اختر ملف واستورد البيانات بسهولة</p>
                  </div>
                </div>
                <button
                  onClick={closeImportModal}
                  className="p-2 hover:bg-gray-200/50 text-gray-500 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {importError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}
                
                {importStep === 1 && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50">
                      <FileText className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="text-sm font-bold text-gray-700 mb-1">رفع ملف Excel أو CSV</p>
                      <p className="text-xs text-gray-500 mb-4">.xlsx, .xls, .csv</p>
                      <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer transition-colors shadow-sm">
                        اختيار ملف
                        <input
                          type="file"
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          className="hidden"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {importStep === 2 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 font-bold mb-4">
                      يرجى مطابقة أعمدة الملف مع بيانات النظام:
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mapping Fields */}
                      {[
                        { key: "name", label: "اسم العضو" },
                        { key: "committee", label: "اللجنة (اختياري، أو تحديد للكل بالأسفل)" },
                        { key: "phone", label: "رقم الجوال" },
                        { key: "email", label: "البريد الإلكتروني" },
                        { key: "nationalId", label: "رقم الهوية" },
                        { key: "title", label: "اللقب (مثل أستاذ، مهندس)" },
                        { key: "role", label: "الصفة (مثل رئيس، عضو)" },
                        { key: "membership_type", label: "آلية الانضمام (مرشح، إلخ)" }
                      ].map(field => (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-[11px] font-black text-gray-700">{field.label}</label>
                          <select
                            className="w-full text-xs h-10 px-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            value={columnMapping[field.key] || ""}
                            onChange={(e) => setColumnMapping({...columnMapping, [field.key]: e.target.value})}
                          >
                            <option value="">- تخطي / غير موجود -</option>
                            {importColumns.map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    {!columnMapping["committee"] && (
                      <div className="pt-4 border-t border-gray-100 space-y-1.5">
                        <label className="text-[11px] font-black text-gray-700">تعيين جميع الأعضاء إلى لجنة محددة:</label>
                        <select
                          className="w-full text-xs h-10 px-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          value={importCommitteeId}
                          onChange={(e) => setImportCommitteeId(e.target.value)}
                        >
                          <option value={0}>- اختر اللجنة -</option>
                          {allCommittees.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {importStep === 3 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 font-bold flex justify-between items-center">
                      <span>البيانات الجاهزة للاستيراد ({importData.length} صف)</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedImportRows.length === importData.length) setSelectedImportRows([]);
                          else setSelectedImportRows(importData.map((_, i) => i));
                        }}
                        className="text-blue-600 underline"
                      >
                        {selectedImportRows.length === importData.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                      <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                          <tr>
                            <th className="p-2 w-10 text-center"></th>
                            {importColumns.slice(0, 4).map(col => (
                              <th key={col} className="p-2 font-black text-gray-600 whitespace-nowrap">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importData.map((row, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedImportRows.includes(idx)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedImportRows([...selectedImportRows, idx]);
                                    else setSelectedImportRows(selectedImportRows.filter(r => r !== idx));
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              {importColumns.slice(0, 4).map(col => (
                                <td key={col} className="p-2 text-gray-800 text-xs truncate max-w-[150px]">
                                  {row[importColumns.indexOf(col)]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
                {importStep === 2 && (
                  <button
                    onClick={() => {
                      setImportStep(3);
                      setSelectedImportRows(importData.map((_, i) => i));
                    }}
                    className="flex-1 min-w-[120px] h-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all shadow-sm"
                  >
                    التالي (معاينة البيانات)
                  </button>
                )}
                
                {importStep === 3 && (
                  <button
                    onClick={executeImport}
                    disabled={isImporting}
                    className="flex-1 min-w-[120px] h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {isImporting ? (
                      <span>جاري الاستيراد...</span>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>تأكيد الاستيراد ({selectedImportRows.length})</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    if (importStep > 1) {
                      setImportStep((importStep - 1) as 1 | 2);
                    } else {
                      closeImportModal();
                    }
                  }}
                  disabled={isImporting}
                  className="px-6 h-10 bg-gray-200 hover:bg-gray-300 text-gray-750 font-extrabold text-xs rounded-xl transition-all"
                >
                  {importStep > 1 ? 'السابق' : 'إلغاء'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

const startIndex = code.indexOf('{/* 📥 EXPORT/IMPORT MODAL */}');
const endIndex = code.lastIndexOf('</AnimatePresence>') + 18;

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + replacementModals + code.substring(endIndex);
  fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
  console.log("Modals replaced successfully");
} else {
  console.log("Could not find modal markers");
}

