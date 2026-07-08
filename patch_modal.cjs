const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const importModal = `
      {/* Import Modal */}
      <AnimatePresence>
        {isImportOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={closeImportModal}
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
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      استيراد أعضاء من ملف Excel
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">استيراد جماعي لبيانات الأعضاء</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeImportModal}
                  className="p-2 hover:bg-gray-200/50 text-gray-500 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {importError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {importError}
                  </div>
                )}

                {importStep === 1 && (
                  <div className="text-center space-y-4">
                    <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-3xl p-12 flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-emerald-500 mb-4" />
                      <h4 className="text-lg font-black text-gray-900">رفع ملف Excel</h4>
                      <p className="text-sm text-gray-500 font-medium mb-6">يرجى رفع ملف بصيغة .xlsx أو .xls</p>
                      
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        اختر الملف
                      </button>
                    </div>
                  </div>
                )}

                {importStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-bold flex gap-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        تم قراءة الملف بنجاح! وجدنا {importData.length} صفاً و {importColumns.length} عاموداً.
                        <br />
                        يرجى مراجعة وتأكيد مطابقة العواميد مع حقول النظام الأساسية.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries({
                        name: "اسم العضو",
                        phone: "رقم الجوال",
                        email: "البريد الإلكتروني",
                        nationalId: "رقم الهوية",
                        committee: "اللجنة"
                      }).map(([sysField, sysLabel]) => (
                        <div key={sysField} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <label className="text-xs font-black text-gray-700 block mb-2">{sysLabel}</label>
                          <select
                            value={columnMapping[sysField] || ""}
                            onChange={(e) => setColumnMapping({ ...columnMapping, [sysField]: e.target.value })}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="">-- تجاهل / غير متوفر --</option>
                            {importColumns.map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setImportStep(3);
                          // select all by default
                          setSelectedImportRows(importData.map((_, i) => i));
                        }}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-colors"
                      >
                        التالي: معاينة البيانات
                      </button>
                    </div>
                  </div>
                )}

                {importStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-black text-gray-600 block">اللجنة (في حال لم يتم تحديدها من الملف)*</label>
                        <select
                          value={importCommitteeId}
                          onChange={(e) => setImportCommitteeId(e.target.value)}
                          className="w-full max-w-sm h-10 px-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold"
                        >
                          <option value={0}>-- يرجى اختيار اللجنة الافتراضية --</option>
                          {allCommittees.filter(c => canUserEditCommittee(c.name)).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                          <thead className="bg-gray-100 border-b border-gray-200 text-gray-700">
                            <tr>
                              <th className="p-3 w-10">
                                <input
                                  type="checkbox"
                                  checked={selectedImportRows.length === importData.length && importData.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedImportRows(importData.map((_, i) => i));
                                    else setSelectedImportRows([]);
                                  }}
                                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                />
                              </th>
                              <th className="p-3 font-black">الاسم</th>
                              <th className="p-3 font-black">الجوال</th>
                              <th className="p-3 font-black">اللجنة</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importData.map((row, i) => {
                              const getV = (f: string) => {
                                const c = columnMapping[f];
                                return c ? (row[importColumns.indexOf(c)] || "-") : "-";
                              };
                              return (
                                <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                                  <td className="p-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedImportRows.includes(i)}
                                      onChange={(e) => {
                                        if (e.target.checked) setSelectedImportRows([...selectedImportRows, i]);
                                        else setSelectedImportRows(selectedImportRows.filter(id => id !== i));
                                      }}
                                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                    />
                                  </td>
                                  <td className="p-3 font-bold text-gray-900">{getV("name")}</td>
                                  <td className="p-3 text-gray-600" dir="ltr">{getV("phone")}</td>
                                  <td className="p-3 text-gray-600">{getV("committee")}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm font-bold text-gray-600">
                        تم تحديد {selectedImportRows.length} من {importData.length} عضو
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setImportStep(2)}
                          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm rounded-xl transition-colors"
                          disabled={isImporting}
                        >
                          رجوع
                        </button>
                        <button
                          type="button"
                          onClick={executeImport}
                          disabled={isImporting || selectedImportRows.length === 0}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isImporting ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          بدء الاستيراد
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
`;

content = content.replace(/      <AnimatePresence>/g, importModal);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
console.log("Patched modal");
