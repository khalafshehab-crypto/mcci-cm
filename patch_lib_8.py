import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

# Replace step 3 view
old_step_3 = '''                {aiGenStep === 3 && (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        الخطاب المولد (يمكنك تعديله يدوياً قبل الطباعة أو الحفظ)
                      </h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiGenGeneratedText);
                          showGlobalToast("تم نسخ الخطاب للمسودة", "success");
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> نسخ النص
                      </button>
                    </div>
                    
                    <div className="flex-1 bg-gray-200/80 p-4 sm:p-8 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
                      <div className="bg-white shadow-xl border border-gray-300 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mx-auto shrink-0 transition-all">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => setAiGenGeneratedText(e.currentTarget.innerText)}
                          className="flex-1 w-full p-12 sm:p-16 text-[16px] leading-[2.2] text-justify font-sans focus:outline-none bg-transparent whitespace-pre-wrap outline-none"
                        >
                          {aiGenGeneratedText}
                        </div>
                      </div>
                    </div>
                  </div>
                )}'''

new_step_3 = '''                {aiGenStep === 3 && (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        {workspaceService === "circular" ? "بيانات التعميم المستخرجة" : "الخطاب المولد (يمكنك تعديله يدوياً قبل الطباعة أو الحفظ)"}
                      </h3>
                      {workspaceService !== "circular" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiGenGeneratedText);
                          showGlobalToast("تم نسخ الخطاب للمسودة", "success");
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> نسخ النص
                      </button>
                      )}
                    </div>
                    
                    {workspaceService === "circular" ? (
                      <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-10">
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-1.5">التعميم وارد من</label>
                          <input type="text" value={circularIncomingFrom} onChange={e => setCircularIncomingFrom(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-1.5">رقم وتاريخ التعميم</label>
                          <input type="text" value={circularNumberDate} onChange={e => setCircularNumberDate(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-1.5">موضوع التعميم</label>
                          <input type="text" value={circularSubject} onChange={e => setCircularSubject(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-1.5">نص توجيهي مقترح لإرساله للجان</label>
                          <textarea value={aiGenGeneratedText.split("نص توجيهي مقترح لإرساله للجان:")[1]?.trim() || aiGenGeneratedText} onChange={e => setAiGenGeneratedText("نص توجيهي مقترح لإرساله للجان:\\n" + e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm min-h-[200px]" />
                        </div>
                      </div>
                    ) : (
                    <div className="flex-1 bg-gray-200/80 p-4 sm:p-8 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
                      <div className="bg-white shadow-xl border border-gray-300 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mx-auto shrink-0 transition-all">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => setAiGenGeneratedText(e.currentTarget.innerText)}
                          className="flex-1 w-full p-12 sm:p-16 text-[16px] leading-[2.2] text-justify font-sans focus:outline-none bg-transparent whitespace-pre-wrap outline-none"
                        >
                          {aiGenGeneratedText}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                )}'''

content = content.replace(old_step_3, new_step_3)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
