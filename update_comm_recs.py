import re

with open("src/pages/CommitteesRecommendations.tsx", "r") as f:
    content = f.read()

# 1. Update the useFirestoreCollection hook for recommendations
content = content.replace(
    'const { data: allDbRecommendations } = useFirestoreCollection<any>("recommendations", []);',
    'const { data: allDbRecommendations, addDocument: addFirebaseRecommendation } = useFirestoreCollection<any>("recommendations", []);'
)

# 2. Add new state variables right after newType
new_states = """  const [newType, setNewType] = useState<"مفردة" | "متسلسلة">("مفردة");
  const [newRecType, setNewRecType] = useState("توصية عادي");
  const [newRecClassification, setNewRecClassification] = useState("توصية عادية");
  const [newRecEventId, setNewRecEventId] = useState("");
  const [newRecPassMethod, setNewRecPassMethod] = useState("عبر البريد الإلكتروني");
  const [newRecTitle, setNewRecTitle] = useState("");
  const [newRecDiscussion, setNewRecDiscussion] = useState("");
  const [newRecText, setNewRecText] = useState("");
  const [newRecAssignee, setNewRecAssignee] = useState("");
  const [newRecDuration, setNewRecDuration] = useState("");
  const [newRecAttachments, setNewRecAttachments] = useState("");
"""
content = re.sub(r'const \[newType, setNewType\] = useState<"مفردة" \| "متسلسلة">\("مفردة"\);', new_states.strip(), content)

# 3. Change handleSubmit to handle the Recommendation save
new_handle_submit = """  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setConflictWarning(null);
    
    if (newType === "متسلسلة") {
      setIsAddOpen(false);
      return;
    }

    if (!newRecTitle.trim() || !newCommitteeId) return;

    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    const eventName = events.find(ev => ev.id === Number(newRecEventId))?.title || "توصية بالتمرير";

    const recEventId = Date.now();
    const newRec: any = {
      id: recEventId,
      title: newRecTitle,
      type: "مفردة",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      committeeId: newCommitteeId,
      committeeName: commName,
      status: "تجهيز التوصية والمسودة",
      location: "حضوري",
      employees: [newRecAssignee].filter(Boolean),
      members: [],
      notes: newRecText,
      exportedRecommendationsToPage: true,
      
      // Recommendation specific fields
      recommendationType: newRecType,
      recommendationClassification: newRecClassification,
      recommendationPassMethod: newRecPassMethod,
      recommendationDiscussion: newRecDiscussion,
      recommendationText: newRecText,
      recommendationAssignee: newRecAssignee,
      recommendationDuration: newRecDuration,
      recommendationAttachments: newRecAttachments,
      
      preparationsText: newRecText,
      preparationsAttachments: newRecAttachments ? [{ id: '1', name: newRecAttachments, url: '#' }] : []
    };

    await addFirebaseEvent(newRec);
    
    // Clear form
    setNewRecTitle("");
    setNewRecDiscussion("");
    setNewRecText("");
    setNewRecAssignee("");
    setNewRecDuration("");
    setNewRecAttachments("");
    setNewCommitteeId(0);
    
    setIsAddOpen(false);
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };"""

content = re.sub(r'const handleSubmit = \(e: FormEvent\) => \{.*?(?=const handleSearchCommit)', new_handle_submit + "\n\n  ", content, flags=re.DOTALL)

# Update form JSX
new_jsx = """
                        <div className="bg-gray-100 p-1 rounded-xl flex shadow-inner">
                          <button
                            type="button"
                            onClick={() => setNewType("مفردة")}
                            className={`px-6 py-2 rounded-lg font-black text-xs transition-all ${
                              newType === "مفردة" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            توصية جديدة
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewType("متسلسلة")}
                            className={`px-6 py-2 rounded-lg font-black text-xs transition-all ${
                              newType === "متسلسلة" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            استيراد التوصيات
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-right" dir="rtl">
                      
                      {newType === "مفردة" && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">اللجنة *</label>
                            <select
                              value={newCommitteeId}
                              onChange={(e) => setNewCommitteeId(Number(e.target.value))}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value={0} disabled>اختر اللجنة</option>
                              {committees.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">النوع *</label>
                            <select
                              value={newRecType}
                              onChange={(e) => setNewRecType(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="توصية عادي">توصية عادي</option>
                              <option value="توصية عاجلة">توصية عاجلة</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">التصنيف *</label>
                            <select
                              value={newRecClassification}
                              onChange={(e) => setNewRecClassification(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="توصية عادية">توصية عادية</option>
                              <option value="توصية بالتمرير">توصية بالتمرير</option>
                            </select>
                          </div>

                          {newRecClassification === "توصية عادية" ? (
                            <div className="md:col-span-full space-y-1">
                              <label className="text-[11px] font-black text-gray-500 block">ارتباط التوصية بالمحضر (الاجتماع)</label>
                              <select
                                value={newRecEventId}
                                onChange={(e) => setNewRecEventId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              >
                                <option value="" disabled>اختر الاجتماع...</option>
                                {events.filter(e => e.committeeId === newCommitteeId).map(ev => (
                                  <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="md:col-span-full space-y-1">
                              <label className="text-[11px] font-black text-gray-500 block">طريقة التمرير</label>
                              <select
                                value={newRecPassMethod}
                                onChange={(e) => setNewRecPassMethod(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              >
                                <option value="عبر البريد الإلكتروني">عبر البريد الإلكتروني</option>
                                <option value="الواتس آب">الواتس آب</option>
                                <option value="غير ذلك">غير ذلك (أذكرها في الملاحظات)</option>
                              </select>
                            </div>
                          )}

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">عنوان التوصية *</label>
                            <input
                              type="text"
                              value={newRecTitle}
                              onChange={(e) => setNewRecTitle(e.target.value)}
                              className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              placeholder="أدخل عنوان التوصية..."
                            />
                          </div>
                          <div className="md:col-span-1 space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">المكلف *</label>
                            <select
                              value={newRecAssignee}
                              onChange={(e) => setNewRecAssignee(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="">اختر المكلف</option>
                              {dynamicEmployees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                            </select>
                          </div>

                          <div className="md:col-span-full space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">المناقشة</label>
                            <textarea
                              value={newRecDiscussion}
                              onChange={(e) => setNewRecDiscussion(e.target.value)}
                              rows={2}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand resize-none"
                              placeholder="تفاصيل المناقشة..."
                            ></textarea>
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">نص التوصية</label>
                            <textarea
                              value={newRecText}
                              onChange={(e) => setNewRecText(e.target.value)}
                              rows={2}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand resize-none"
                              placeholder="نص التوصية هنا..."
                            ></textarea>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">مدة التنفيذ</label>
                            <input
                              type="text"
                              value={newRecDuration}
                              onChange={(e) => setNewRecDuration(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              placeholder="مثال: أسبوعين، 5 أيام..."
                            />
                          </div>

                          <div className="md:col-span-full space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">المرفقات</label>
                            <input
                              type="text"
                              value={newRecAttachments}
                              onChange={(e) => setNewRecAttachments(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              placeholder="أدخل روابط أو أسماء المرفقات..."
                            />
                          </div>
                        </>
                      )}

                      {newType === "متسلسلة" && (
                        <div className="md:col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                           <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                           <p className="text-gray-500 font-bold">ميزة استيراد التوصيات من ملفات Excel قريباً</p>
                        </div>
                      )}
                    </div>
                </div>

                <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20 active:scale-95"
                  >
                    {newType === "متسلسلة" ? "استيراد" : (editingEvent ? "حفظ التعديلات" : "إضافة التوصية")}
                  </button>
"""

pattern = r'<div className="bg-gray-100 p-1 rounded-xl flex shadow-inner">.*?(?=\{newType === "متسلسلة" \? "استعراض الجدول" : \(editingEvent \? "حفظ التعديلات" : "إضافة الفعالية"\)\})\{newType === "متسلسلة" \? "استعراض الجدول" : \(editingEvent \? "حفظ التعديلات" : "إضافة الفعالية"\)\}'
content = re.sub(pattern, new_jsx.strip(), content, flags=re.DOTALL)

# Header modifications
content = content.replace('إضافة فعالية جديدة', 'إضافة توصية جديدة')
content = content.replace('سجل بيانات الفعالية بدقة لربط وتحديث مؤشرات الأداء والمهام', 'سجل بيانات التوصية بدقة لربط وتحديث مؤشرات الأداء والمهام')
content = content.replace('تعديل فعالية:', 'تعديل توصية:')
content = content.replace('إضافة الفعالية', 'إضافة التوصية')

with open("src/pages/CommitteesRecommendations.tsx", "w") as f:
    f.write(content)

