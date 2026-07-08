const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');

const regex = /                    <button\n                      onClick=\{\(\) => setSelectedCommIdForCards\(comm\.id\)\}\n                      className="w-full py-3 bg-brand text-white hover:bg-\[#dfba6b\] hover:text-\[#1e293b\] font-black text-xs rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"\n                   \) : \/\* Level 3: Classifications inside selected Event Kind & Committee \*\/\n          selectedClassificationForCards === null \? \([\s\S]*?\{count\} فعاليات مسجلة\n                          <\/span>/m;

const replacement = `                    <button
                      onClick={() => setSelectedCommIdForCards(comm.id)}
                      className="w-full py-3 bg-brand text-white hover:bg-[#dfba6b] hover:text-[#1e293b] font-black text-xs rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>المزيد من التفاصيل (حسب نوع الفعالية)</span>
                      <span>←</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : /* Level 2: Event Kinds inside selected Committee */
          selectedEventKindForCards === null ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-800">تصفح فعاليات اللجنة حسب النوع</h3>
                <button
                  onClick={() => setSelectedCommIdForCards(null)}
                  className="text-xs text-brand font-black hover:underline"
                >
                  الرجوع لقائمة اللجان الرئيسية ↑
                </button>
              </div>

              {(() => {
                const commEvents = filteredEvents.filter((e) => e.committeeId === selectedCommIdForCards);
                const uniqueKinds = Array.from(new Set(commEvents.map((e) => getEventKindStr(e.title))));

                if (uniqueKinds.length === 0) {
                  return (
                    <div className="bg-white border border-gray-150 rounded-2xl p-10 text-center text-gray-500 font-bold text-sm">
                      لا توجد أية فعاليات مسجلة لهذه اللجنة حالياً.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uniqueKinds.map((kind) => {
                      const count = commEvents.filter((e) => getEventKindStr(e.title) === kind).length;
                      return (
                        <motion.div
                          key={kind}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border-2 border-slate-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-55/70 text-blue-800 border border-blue-100 flex items-center justify-center font-black">
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-gray-800">{kind}</h4>
                              <p className="text-[10px] text-gray-400 font-bold">بناءً على تصنيف الفعاليات المجدولة</p>
                            </div>
                          </div>

                          <span className="inline-block self-start px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-lg">
                            {count} فعاليات مسجلة
                          </span>

                          <button
                            onClick={() => setSelectedEventKindForCards(kind)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>تصفح حسب التصنيف</span>
                            <span>←</span>
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : /* Level 3: Classifications inside selected Event Kind & Committee */
          selectedClassificationForCards === null ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-800">
                  فرز فعاليات النوع (<span className="text-blue-600">{selectedEventKindForCards}</span>) حسب التصنيف
                </h3>
                <button
                  onClick={() => setSelectedEventKindForCards(null)}
                  className="text-xs text-brand font-black hover:underline"
                >
                  الرجوع خطوة للأعلى (عناوين أنواع الفعاليات) ↑
                </button>
              </div>
              {(() => {
                const kindEvents = filteredEvents.filter(
                  (e) => e.committeeId === selectedCommIdForCards && getEventKindStr(e.title) === selectedEventKindForCards
                );
                const activeClassifications = Array.from(new Set(kindEvents.map((e) => getEventClassification(e.title))));

                if (activeClassifications.length === 0) {
                  return (
                    <div className="bg-white border border-gray-150 rounded-2xl p-10 text-center text-gray-500 font-bold text-sm">
                      لا يوجد أي تصنيف للفعاليات المدرجة حالياً.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeClassifications.map((cls) => {
                      const count = kindEvents.filter((e) => getEventClassification(e.title) === cls).length;

                      return (
                        <motion.div
                          key={cls}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border-2 border-slate-100 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-55/70 text-emerald-800 border border-emerald-100 flex items-center justify-center font-black animate-pulse">
                              <Sliders className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-gray-800">{cls}</h4>
                              <p className="text-[10px] text-gray-400 font-bold">نمط الإضافة في الجداول المبرمجة</p>
                            </div>
                          </div>
                          <span className="inline-block self-start px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg">
                            {count} فعاليات مسجلة
                          </span>`;

if (regex.test(content)) {
  fs.writeFileSync('src/pages/CommitteesEvents.tsx', content.replace(regex, replacement));
  console.log("Patched successfully!");
} else {
  console.log("Regex did not match.");
}
