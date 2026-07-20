const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const oldStep1 = `{importStep === 1 && (
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
                )}`;

const newStep1 = `{importStep === 1 && (
                  <div className="space-y-6">
                    {/* Google Sheets URL Import */}
                    <div className="border border-blue-200 bg-blue-50/50 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                      <ExternalLink className="w-10 h-10 text-blue-500 mb-3" />
                      <h4 className="text-base font-black text-gray-900 mb-1">استيراد من Google Drive</h4>
                      <p className="text-xs text-gray-500 font-medium mb-4 max-w-sm mx-auto">
                        قم بلصق رابط ملف جدول البيانات (Google Sheets). <br/> يجب أن يكون الملف "متاح لأي شخص لديه الرابط".
                      </p>
                      
                      <div className="w-full max-w-md flex flex-col sm:flex-row gap-2">
                        <input 
                          type="text" 
                          dir="ltr"
                          value={googleSheetUrl}
                          onChange={(e) => setGoogleSheetUrl(e.target.value)}
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          className="flex-1 h-11 px-4 text-xs font-mono border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
                        />
                        <button
                          type="button"
                          onClick={handleFetchGoogleSheet}
                          disabled={isFetchingSheet || !googleSheetUrl}
                          className="h-11 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-colors whitespace-nowrap flex items-center justify-center"
                        >
                          {isFetchingSheet ? "جاري الجلب..." : "جلب البيانات"}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <span className="text-xs font-black text-gray-400">أو</span>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    {/* Local File Import */}
                    <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center bg-gray-50/50 text-center hover:bg-gray-50 transition-colors">
                      <FileText className="w-10 h-10 text-gray-400 mb-3" />
                      <h4 className="text-base font-black text-gray-900 mb-1">رفع ملف من الجهاز</h4>
                      <p className="text-xs text-gray-500 font-medium mb-4">
                        اختر ملف بصيغة (Excel, CSV) لاستيراد البيانات منه.
                      </p>
                      <label className="h-11 px-6 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 rounded-xl text-xs font-black cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>استعراض الملفات</span>
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
                )}`;

if (code.includes('border-2 border-dashed border-gray-200 rounded-2xl p-8')) {
  code = code.replace(oldStep1, newStep1);
  fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
  console.log("Updated step 1");
} else {
  console.log("Could not find step 1");
}
