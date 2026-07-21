const fs = require('fs');

let code = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

// 1. Add states
const stateVariables = `
  // AI Generator States
  const [isAIGenOpen, setIsAIGenOpen] = useState(false);
  const [aiGenStep, setAiGenStep] = useState(1);
  const [aiGenCommittee, setAiGenCommittee] = useState("");
  const [aiGenRecipientName, setAiGenRecipientName] = useState("");
  const [aiGenRecipientPosition, setAiGenRecipientPosition] = useState("");
  const [aiGenSubject, setAiGenSubject] = useState("");
  const [aiGenDetails, setAiGenDetails] = useState("");
  const [aiGenContact, setAiGenContact] = useState("");
  const [aiGenAttachments, setAiGenAttachments] = useState("");
  const [aiGenSignatory, setAiGenSignatory] = useState("");
  const [aiGenGeneratedText, setAiGenGeneratedText] = useState("");
  const [isAIGenGenerating, setIsAIGenGenerating] = useState(false);

  const openGenerateWizard = () => {
    setIsWizardOpen(false);
    setAiGenStep(1);
    setAiGenCommittee("");
    setAiGenRecipientName("");
    setAiGenRecipientPosition("");
    setAiGenSubject("");
    setAiGenDetails("");
    setAiGenContact("");
    setAiGenAttachments("");
    setAiGenSignatory("الأمين العام");
    setAiGenGeneratedText("");
    setIsAIGenOpen(true);
  };

  const handleGenerateNewLetter = async () => {
    setIsAIGenGenerating(true);
    try {
      const response = await fetch("/api/gemini/generate-new-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          committeeName: committees.find(c => String(c.id) === String(aiGenCommittee))?.name || aiGenCommittee,
          recipientName: aiGenRecipientName,
          recipientPosition: aiGenRecipientPosition,
          subject: aiGenSubject,
          details: aiGenDetails,
          contact: aiGenContact,
          attachments: aiGenAttachments,
          signatory: aiGenSignatory
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiGenGeneratedText(data.result || "");
        setAiGenStep(3);
      } else {
        alert("فشل توليد الخطاب. يرجى التأكد من الإعدادات.");
      }
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء التوليد.");
    } finally {
      setIsAIGenGenerating(false);
    }
  };

  const handleSaveArchivedLetter = async () => {
    const newDoc = {
      title: aiGenSubject || "خطاب جديد",
      description: \`خطاب صادر إلى \${aiGenRecipientName} - \${aiGenRecipientPosition}\`,
      type: "خطاب ذكي",
      creator: "مدير النظام",
      cloudUrl: "#",
      downloadUrl: "#",
      lastUpdated: new Date().toISOString().split('T')[0],
      isFavorite: false,
      templateText: aiGenGeneratedText
    };
    try {
      await addDoc(collection(db, "templates"), newDoc);
      setIsAIGenOpen(false);
      alert("تم حفظ الخطاب بنجاح في المكتبة.");
    } catch (e) {
      console.error(e);
      alert("فشل الحفظ.");
    }
  };
`;

if (!code.includes('const [isAIGenOpen')) {
  code = code.replace(/const \[smartLetterMode[^]*?;/, match => match + '\n' + stateVariables);
}

// 2. Modify "جديد" button
const newButton = `onClick={() => {
                      openGenerateWizard();
                    }}`;
code = code.replace(/onClick=\{\(\) => \{\s*setSmartLetterMode\("create_new"\);\s*setSlTitle\(""\);\s*setSlContent\(""\);\s*setSlVariables\(\[\]\);\s*setSlValues\(\{\}\);\s*setIsSmartLetterOpen\(true\);\s*setIsWizardOpen\(false\);\s*\}\}/g, newButton);


// 3. Insert Modal JSX
const aiGenModalJSX = `
      {/* AI Generator Modal */}
      <AnimatePresence>
        {isAIGenOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAIGenOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl z-10 flex flex-col max-h-[95vh]"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-l from-indigo-50/50 to-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">المساعد الذكي لإنشاء الخطابات</h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">الخطوة {aiGenStep} من 3</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAIGenOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
                {aiGenStep === 1 && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 text-center mb-8">اختر اللجنة للارتباط والأرشفة</h3>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">اللجنة القطاعية</label>
                      <select
                        value={aiGenCommittee}
                        onChange={(e) => setAiGenCommittee(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm"
                      >
                        <option value="">-- اختر اللجنة --</option>
                        {committees.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="pt-6 flex justify-end">
                      <button
                        onClick={() => {
                          if (!aiGenCommittee) {
                            alert("يرجى اختيار اللجنة أولاً");
                            return;
                          }
                          setAiGenStep(2);
                        }}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors"
                      >
                        التالي: تفاصيل الخطاب
                      </button>
                    </div>
                  </div>
                )}

                {aiGenStep === 2 && (
                  <div className="max-w-3xl mx-auto space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">اسم المرسل إليه</label>
                        <input
                          type="text"
                          value={aiGenRecipientName}
                          onChange={(e) => setAiGenRecipientName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm"
                          placeholder="مثال: د. عبد الله السالم"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">منصبه</label>
                        <input
                          type="text"
                          value={aiGenRecipientPosition}
                          onChange={(e) => setAiGenRecipientPosition(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm"
                          placeholder="مثال: مدير عام الشؤون الإدارية"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">موضوع الخطاب</label>
                      <input
                        type="text"
                        value={aiGenSubject}
                        onChange={(e) => setAiGenSubject(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm"
                        placeholder="موضوع الخطاب..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">تفاصيل ومحتوى الخطاب</label>
                      <textarea
                        value={aiGenDetails}
                        onChange={(e) => setAiGenDetails(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm resize-none"
                        placeholder="اكتب نقاطاً أو ملخصاً لما تود أن يغطيه الخطاب..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">مرفقات الخطاب</label>
                        <input
                          type="text"
                          value={aiGenAttachments}
                          onChange={(e) => setAiGenAttachments(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm"
                          placeholder="مثال: عدد 3 تقارير، نسخة من القرار"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">ضابط الاتصال</label>
                        <input
                          type="text"
                          value={aiGenContact}
                          onChange={(e) => setAiGenContact(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm"
                          placeholder="مثال: أخصائي اللجنة (رقم 050000000)"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">من سيوقع الخطاب؟</label>
                      <input
                        type="text"
                        value={aiGenSignatory}
                        onChange={(e) => setAiGenSignatory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-sm"
                        placeholder="الأمين العام"
                      />
                    </div>

                    <div className="pt-6 flex items-center justify-between">
                      <button
                        onClick={() => setAiGenStep(1)}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        السابق
                      </button>
                      <button
                        onClick={handleGenerateNewLetter}
                        disabled={isAIGenGenerating || !aiGenRecipientName || !aiGenSubject}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isAIGenGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري التوليد...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5" />
                            توليد الخطاب الذكي
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {aiGenStep === 3 && (
                  <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-full">
                    <div className="flex-1 min-h-[400px]">
                      <textarea
                        value={aiGenGeneratedText}
                        onChange={(e) => setAiGenGeneratedText(e.target.value)}
                        className="w-full h-full p-6 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-bold text-base resize-none shadow-inner"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setAiGenStep(2)}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        السابق للتعديل
                      </button>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsAIGenOpen(false)}
                          className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-200 transition-colors"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={() => {
                            const printWindow = window.open("", "_blank");
                            if (printWindow) {
                              printWindow.document.write(\`
                                <html dir="rtl" lang="ar">
                                <head>
                                  <title>طباعة الخطاب</title>
                                  <style>
                                    body { font-family: 'Cairo', sans-serif; padding: 40px; line-height: 1.8; font-size: 16px; white-space: pre-wrap; }
                                    @media print { body { padding: 0; } }
                                  </style>
                                </head>
                                <body>\${aiGenGeneratedText}</body>
                                </html>
                              \`);
                              printWindow.document.close();
                              printWindow.focus();
                              setTimeout(() => {
                                printWindow.print();
                                printWindow.close();
                              }, 250);
                            }
                          }}
                          className="px-6 py-3 bg-blue-100 text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-200 transition-colors flex items-center gap-2"
                        >
                          <Printer className="w-5 h-5" />
                          طباعة
                        </button>
                        <button
                          onClick={handleSaveArchivedLetter}
                          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          الحفظ والأرشفة
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

if (!code.includes('{/* AI Generator Modal */}')) {
  code = code.replace('{/* Smart Letter Modal */}', aiGenModalJSX + '\n      {/* Smart Letter Modal */}');
}

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', code);
console.log("Patched CommitteesLibrary.tsx successfully.");
