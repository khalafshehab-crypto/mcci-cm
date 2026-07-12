const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');

const generateFn = `  const [isGeneratingSmartText, setIsGeneratingSmartText] = useState(false);

  const handleGenerateSmartText = async () => {
    if (!newRecText) {
      setAlertState({ isOpen: true, message: "الرجاء إدخال نص التوصية الأصلي أولاً لتوليد النص الذكي.", onClose: () => {} });
      return;
    }
    
    setIsGeneratingSmartText(true);
    try {
      const response = await fetch('/api/gemini/smart-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newRecText }),
      });
      
      if (!response.ok) {
        throw new Error("فشل توليد النص");
      }
      
      const data = await response.json();
      if (data.result) {
        setNewRecText(data.result);
      }
    } catch (err) {
      console.error(err);
      setAlertState({ isOpen: true, message: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.", onClose: () => {} });
    } finally {
      setIsGeneratingSmartText(false);
    }
  };
`;

code = code.replace(
  '  const [isConfirmingSeries, setIsConfirmingSeries] = useState(false);',
  generateFn + '\n  const [isConfirmingSeries, setIsConfirmingSeries] = useState(false);'
);

// Update HTML for the button
const recTextAreaBlock = `                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">نص التوصية</label>
                            <textarea
                              value={newRecText}
                              onChange={(e) => setNewRecText(e.target.value)}
                              rows={2}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand resize-none"
                              placeholder="نص التوصية هنا..."
                            ></textarea>
                          </div>`;

const newRecTextAreaBlock = `                          <div className="md:col-span-2 space-y-1 relative">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-black text-gray-500 block">نص التوصية</label>
                              <button
                                type="button"
                                onClick={handleGenerateSmartText}
                                disabled={isGeneratingSmartText}
                                className="text-[10px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded-md font-bold flex items-center gap-1 border border-indigo-200 transition-colors disabled:opacity-50"
                              >
                                {isGeneratingSmartText ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    جاري التوليد...
                                  </>
                                ) : (
                                  <>
                                    <span>✨ توليد النص الذكي</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <textarea
                              value={newRecText}
                              onChange={(e) => setNewRecText(e.target.value)}
                              rows={3}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand resize-none"
                              placeholder="نص التوصية هنا..."
                            ></textarea>
                          </div>`;

code = code.replace(recTextAreaBlock, newRecTextAreaBlock);

fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', code);
console.log("Done patching frontend smart text");
