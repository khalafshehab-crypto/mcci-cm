const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Add the button
  if (code.includes('<span>إنشاء قالب</span>') && !code.includes('<span>توليد خطاب ذكي</span>')) {
    const btn = `
          <button
            type="button"
            onClick={openGenerateWizard}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0 w-full lg:w-auto"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>توليد خطاب ذكي</span>
          </button>
`;
    // Find the button and append
    code = code.replace(/<button[^>]*onClick={\(\) => \{ setWizardStep\("type"\); setIsWizardOpen\(true\); \}\}[^>]*>[\s\S]*?<\/button>/, match => match + btn);
  }

  // Add the modal
  if (!code.includes('key="ai-generator-modal"')) {
    const modal = `
      {/* AI Generator Modal */}
      <AnimatePresence>
        {isAIGenOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAIGenOpen(false)} />
            <motion.div
              key="ai-generator-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl z-10 flex flex-col max-h-[95vh]"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-l from-emerald-50/50 to-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">توليد خطاب ذكي</h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                      الخطوة {aiGenStep} من 3
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAIGenOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {aiGenStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">اختر اللجنة للربط والأرشفة</label>
                      <select
                        value={aiGenCommittee}
                        onChange={(e) => setAiGenCommittee(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      >
                        <option value="">-- اختر اللجنة --</option>
                        {committees.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => {
                          if (!aiGenCommittee) {
                            showToast("الرجاء اختيار اللجنة", "warning");
                            return;
                          }
                          setAiGenStep(2);
                        }}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                      >
                        التالي
                      </button>
                    </div>
                  </div>
                )}

                {aiGenStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم المرسل إليه</label>
                        <input
                          type="text"
                          value={aiGenRecipientName}
                          onChange={(e) => setAiGenRecipientName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">منصبه</label>
                        <input
                          type="text"
                          value={aiGenRecipientPosition}
                          onChange={(e) => setAiGenRecipientPosition(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">موضوع الخطاب</label>
                      <input
                        type="text"
                        value={aiGenSubject}
                        onChange={(e) => setAiGenSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">تفاصيل الخطاب</label>
                      <textarea
                        value={aiGenDetails}
                        onChange={(e) => setAiGenDetails(e.target.value)}
                        className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">ضابط الاتصال</label>
                        <input
                          type="text"
                          value={aiGenContact}
                          onChange={(e) => setAiGenContact(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">المرفقات</label>
                        <input
                          type="text"
                          value={aiGenAttachments}
                          onChange={(e) => setAiGenAttachments(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">الموقع على الخطاب</label>
                      <input
                        type="text"
                        value={aiGenSignatory}
                        onChange={(e) => setAiGenSignatory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setAiGenStep(1)}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                      >
                        السابق
                      </button>
                      <button
                        onClick={generateAILetter}
                        disabled={isAIGenGenerating || !aiGenSubject || !aiGenRecipientName}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isAIGenGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        توليد الخطاب
                      </button>
                    </div>
                  </div>
                )}

                {aiGenStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">النص المولد (قابل للتحرير)</label>
                      <textarea
                        value={aiGenGeneratedText}
                        onChange={(e) => setAiGenGeneratedText(e.target.value)}
                        className="w-full h-64 px-4 py-3 border border-gray-200 rounded-lg text-sm leading-relaxed"
                      />
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setAiGenStep(2)}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                      >
                        السابق
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                             window.print();
                          }}
                          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                        >
                          طباعة
                        </button>
                        <button
                          onClick={saveAIGeneratedLetter}
                          className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                          حفظ وأرشفة
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
`;
    code = code.replace(/<\/AnimatePresence>\s*<\/div>\s*\);\s*}\s*$/, `</AnimatePresence>\n${modal}\n    </div>\n  );\n}`);
  }

  fs.writeFileSync(file, code);
}

patchFile('src/pages/CommitteesLibrary.tsx');
patchFile('src/pages/Library.tsx');
