const fs = require('fs');
const path = 'src/pages/CommitteesEvents.tsx';
let code = fs.readFileSync(path, 'utf8');

const aiSection = `
                                            {/* AI Minutes of Meeting */}
                                            <div className="bg-gradient-to-r from-brand/5 to-transparent p-4 border border-brand/20 rounded-xl mb-4">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-brand" />
                                                <h4 className="text-[10px] font-black text-brand">المساعد الذكي (تلخيص واستخراج آلي للمسودة)</h4>
                                              </div>
                                              <textarea
                                                id={\`draft-\${evt.id}\`}
                                                placeholder="اكتب أو انسخ هنا الملاحظات العشوائية أو المسودة السريعة للاجتماع..."
                                                className="w-full text-[10px] font-bold p-3 border border-brand/30 rounded-lg bg-white text-right focus:outline-none focus:border-brand h-24 mb-2 resize-none"
                                              />
                                              <button
                                                type="button"
                                                onClick={async () => {
                                                  const draftText = (document.getElementById(\`draft-\${evt.id}\`) as HTMLTextAreaElement).value;
                                                  if (!draftText.trim()) return showGlobalToast("يرجى كتابة المسودة أولاً", "error");
                                                  
                                                  try {
                                                    showGlobalToast("جاري التلخيص والاستخراج الذكي...", "loading");
                                                    const res = await fetch("/api/gemini/summarize-minutes", {
                                                      method: "POST",
                                                      headers: { "Content-Type": "application/json" },
                                                      body: JSON.stringify({ text: draftText, userApiKey: JSON.parse(localStorage.getItem("mcci_user_profile") || "{}").apiKey || "" })
                                                    });
                                                    const data = await res.json();
                                                    
                                                    if (!res.ok) throw new Error(data.error || "Failed");
                                                    
                                                    const result = data.result;
                                                    
                                                    const newAgendaItem = {
                                                      id: Math.random().toString(36).substring(2, 9),
                                                      title: "ملخص الاجتماع وتوصيات الذكاء الاصطناعي",
                                                      specialist: "المساعد الذكي",
                                                      duration: "آلي",
                                                      discussion: result.summary || "",
                                                      recommendationText: result.recommendations?.map((r:any) => \`\${r.text} (المسؤول: \${r.assignedTo}, المدة: \${r.duration})\`).join("\\n") || "",
                                                      assignedRec: result.recommendations?.[0]?.assignedTo || "غير محدد",
                                                      durationRec: result.recommendations?.[0]?.duration || "",
                                                      impactType: "عادية"
                                                    };
                                                    
                                                    const updatedAgenda = [...(evt.agenda || []), newAgendaItem];
                                                    updateEventWorkflow(evt.id, { agenda: updatedAgenda });
                                                    showGlobalToast("تم استخراج المحضر والتوصيات بنجاح", "success");
                                                    (document.getElementById(\`draft-\${evt.id}\`) as HTMLTextAreaElement).value = "";
                                                    
                                                  } catch (err: any) {
                                                    showGlobalToast(err.message, "error");
                                                  }
                                                }}
                                                className="bg-brand text-white px-4 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-brand/90 transition-all shadow-sm"
                                              >
                                                <Sparkles className="w-3.5 h-3.5" /> توليد المحضر الرسمي
                                              </button>
                                            </div>
`;

if (!code.includes('المساعد الذكي (تلخيص واستخراج آلي للمسودة)')) {
  // We need to inject it right after: <span className="text-[9px] text-gray-500 font-bold">مرحلة 6 من 8</span> </div>
  code = code.replace(
    /<span className="text-\[9px\] text-gray-500 font-bold">مرحلة 6 من 8<\/span>\s*<\/div>/,
    `<span className="text-[9px] text-gray-500 font-bold">مرحلة 6 من 8</span></div>\n${aiSection}`
  );
  
  // Also make sure Sparkles is imported
  if (!code.includes('Sparkles,')) {
    code = code.replace('import { ', 'import { Sparkles, ');
  }

  fs.writeFileSync(path, code);
  console.log("Patched CommitteesEvents.tsx for AI Minutes");
}
