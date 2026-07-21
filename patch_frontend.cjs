const fs = require('fs');

const modalJSX = `
      {/* Smart Letter Modal */}
      <AnimatePresence>
        {isSmartLetterOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSmartLetterOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-7xl z-10 flex flex-col max-h-[95vh]"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-l from-indigo-50/50 to-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">{smartLetterMode === "create" ? "إنشاء قالب خطابات ذكي أو إعداد رد" : "تعبئة خطاب ذكي"}</h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                      {smartLetterMode === "create" ? "أدخل نص الخطاب الجديد، أو أرفق خطاباً وارداً لإنشاء رد تلقائي" : "قم بتعبئة المتغيرات لمعاينة الخطاب وتصديره"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSmartLetterOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50/50">
                {/* Left Column (Inputs) */}
                <div className="space-y-6 flex flex-col">
                  {smartLetterMode === "create" && (
                    <>
                      <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-indigo-800 text-sm flex items-center gap-2">
                          <Wand2 className="w-4 h-4 text-indigo-500" />
                          إعداد رد تلقائي على خطاب وارد
                        </h3>
                        <div className="space-y-3">
                          <textarea
                            id="incomingLetterText"
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm resize-none"
                            placeholder="انسخ والصق نص الخطاب الوارد هنا..."
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-50 transition-colors font-bold text-sm">
                              <Paperclip className="w-4 h-4" />
                              <span id="uploadFileName">إرفاق ملف الخطاب (PDF, صورة)</span>
                              <input 
                                type="file" 
                                className="hidden"
                                accept="application/pdf,image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    document.getElementById('uploadFileName')!.textContent = file.name;
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const base64 = (ev.target?.result as string).split(',')[1];
                                      (window as any)._incomingLetterFile = { base64, mimeType: file.type, name: file.name };
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={async () => {
                                const text = (document.getElementById('incomingLetterText') as HTMLTextAreaElement).value;
                                const fileObj = (window as any)._incomingLetterFile;
                                if (!text.trim() && !fileObj) {
                                  alert("يرجى إدخال نص الخطاب أو إرفاق ملف");
                                  return;
                                }
                                const btn = document.getElementById('generateReplyBtn');
                                if (btn) {
                                  btn.innerHTML = '<span class="flex items-center gap-2"><svg class="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>جاري توليد الرد...</span>';
                                  btn.setAttribute('disabled', 'true');
                                }
                                try {
                                  const response = await fetch("/api/gemini/reply-to-letter", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      incomingLetter: text,
                                      fileBase64: fileObj?.base64,
                                      mimeType: fileObj?.mimeType
                                    })
                                  });
                                  const data = await response.json();
                                  if (response.ok) {
                                    setSlContent(data.result);
                                    if (!slTitle) setSlTitle("رد على خطاب وارد");
                                  } else {
                                    alert("خطأ: " + (data.error?.message || data.error));
                                  }
                                } catch (e) {
                                  alert("حدث خطأ أثناء التوليد");
                                } finally {
                                  if (btn) {
                                    btn.innerHTML = '<span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand2 w-4 h-4"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>توليد الرد التلقائي</span>';
                                    btn.removeAttribute('disabled');
                                  }
                                }
                              }}
                              id="generateReplyBtn"
                              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
                            >
                              <span className="flex items-center gap-2"><Wand2 className="w-4 h-4" />توليد الرد التلقائي</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5">عنوان الخطاب (القالب)</label>
                          <input
                            type="text"
                            value={slTitle}
                            onChange={(e) => setSlTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm"
                            placeholder="مثال: دعوة حضور اجتماع"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1.5 flex justify-between">
                            <span>نص الخطاب (الثوابت والمتغيرات)</span>
                            <span className="text-xs font-normal text-indigo-500">استخدم [الاسم] للمتغيرات</span>
                          </label>
                          <textarea
                            value={slContent}
                            onChange={(e) => setSlContent(e.target.value)}
                            rows={12}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm leading-relaxed resize-none"
                            dir="auto"
                            placeholder="السيد [الاسم] المحترم،\nندعوكم لحضور [الفعالية]..."
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Variables Fill Area */}
                  {slVariables.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4 flex-1">
                      <h3 className="font-bold text-indigo-800 text-sm flex items-center gap-2 border-b border-indigo-50 pb-3">
                        <Edit2 className="w-4 h-4 text-indigo-500" />
                        تعبئة المتغيرات
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {slVariables.map((v, i) => (
                          <div key={i}>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">{v}</label>
                            <input
                              type="text"
                              value={slValues[v] || ""}
                              onChange={(e) => setSlValues(prev => ({...prev, [v]: e.target.value}))}
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm shadow-sm"
                              placeholder={\`أدخل \${v}...\`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column (Preview) */}
                <div className="flex flex-col">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-3 px-1">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    المعاينة الحية للخطاب
                  </h3>
                  <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden p-8 flex flex-col relative min-h-[500px]">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
                    <div className="flex-1 whitespace-pre-wrap font-sans text-gray-800 leading-8 text-base" id="smart-letter-preview">
                      {slPreview}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-end text-sm text-gray-500 font-bold">
                      <div>التاريخ: {new Date().toLocaleDateString('ar-SA')}</div>
                      <div className="text-left">
                        التوقيع
                        <br />
                        ........................
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSmartLetterOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const printWin = window.open('', '_blank');
                    if (printWin) {
                      printWin.document.write(\`
                        <html dir="rtl">
                          <head>
                            <title>\${slTitle || 'طباعة الخطاب'}</title>
                            <style>
                              body { font-family: 'Cairo', system-ui, sans-serif; padding: 40px; color: #000; line-height: 2; max-width: 800px; margin: 0 auto; }
                              .content { white-space: pre-wrap; font-size: 18px; min-height: 400px; }
                              .footer { margin-top: 80px; display: flex; justify-content: space-between; font-weight: bold; }
                              @media print {
                                body { padding: 0; }
                                @page { margin: 2cm; }
                              }
                            </style>
                          </head>
                          <body>
                            <div class="content">\${slPreview.replace(/\\n/g, '<br>')}</div>
                            <div class="footer">
                              <div>التاريخ: \${new Date().toLocaleDateString('ar-SA')}</div>
                              <div style="text-align: left;">التوقيع<br/>........................</div>
                            </div>
                            <script>
                              window.onload = () => { window.print(); window.close(); }
                            </script>
                          </body>
                        </html>
                      \`);
                      printWin.document.close();
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 shadow-sm transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  طباعة
                </button>
                
                {smartLetterMode === "create" && (
                  <button
                    type="button"
                    onClick={handleSaveSmartLetter}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    حفظ القالب
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}`;

function patchModal(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');
  const targetReg = /\{\/\* Smart Letter Modal \*\/\}.*\{\/\* Delete Confirmation Modal \*\/\}/s;
  
  if (targetReg.test(code)) {
    code = code.replace(targetReg, modalJSX);
    fs.writeFileSync(filepath, code);
    console.log("Patched modal in " + filepath);
  } else {
    console.log("Target not found in " + filepath);
  }
}

patchModal('src/pages/CommitteesLibrary.tsx');
patchModal('src/pages/Library.tsx');
