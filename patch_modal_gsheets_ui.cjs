const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const importStep1 = `
                {importStep === 1 && (
                  <div className="text-center space-y-4">
                    <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-3xl p-8 flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-emerald-500 mb-4" />
                      <h4 className="text-lg font-black text-gray-900">رفع ملف Excel</h4>
                      <p className="text-sm text-gray-500 font-medium mb-6">يرجى رفع ملف بصيغة .xlsx أو .xls من جهازك</p>
                      
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
                        اختر الملف من الجهاز
                      </button>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <span className="text-xs font-bold text-gray-400">أو</span>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <div className="border border-blue-200 bg-blue-50/50 rounded-3xl p-8 flex flex-col items-center justify-center">
                      <ExternalLink className="w-12 h-12 text-blue-500 mb-4" />
                      <h4 className="text-lg font-black text-gray-900">استيراد من Google Drive</h4>
                      <p className="text-sm text-gray-500 font-medium mb-4 text-center max-w-sm">
                        قم بلصق رابط ملف جدول البيانات (Google Sheets). <br/> يجب أن يكون الملف "متاح لأي شخص لديه الرابط".
                      </p>
                      
                      <div className="flex gap-2 w-full max-w-md">
                        <input
                          type="url"
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          value={googleSheetUrl}
                          onChange={(e) => setGoogleSheetUrl(e.target.value)}
                          className="flex-1 h-11 px-4 bg-white border border-blue-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-left"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={handleFetchGoogleSheet}
                          disabled={isFetchingSheet || !googleSheetUrl}
                          className="h-11 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          {isFetchingSheet ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            "جلب الملف"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
`;

const regex = /                \{importStep === 1 && \([\s\S]*?                  <\/div>\n                \)\}/;
content = content.replace(regex, importStep1.trim());
fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
console.log("Patched modal UI");
