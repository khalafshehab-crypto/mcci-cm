import re

with open('src/pages/CommitteesRecommendations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                const commEvents = events.filter((e) => e.committeeId === selectedCommIdForCards && !e.exportedRecommendationsToPage);"""

replacement = """                const commEvents = events.filter((e) => e.committeeId === selectedCommIdForCards && !e.exportedRecommendationsToPage);
                const standaloneRecs = events.filter((e) => e.committeeId === selectedCommIdForCards && e.exportedRecommendationsToPage);"""

content = content.replace(target, replacement)


target2 = """                if (commEvents.length === 0) {"""
replacement2 = """                if (commEvents.length === 0 && standaloneRecs.length === 0) {"""
content = content.replace(target2, replacement2)

target3 = """                    {commEvents.map((evt) => {"""
replacement3 = """                    {commEvents.map((evt) => {"""

# Find the end of the Grid for commEvents
target_end_grid = """                    })}
                  </div>
                );
              })()}
            </div>
          ) : ("""

replacement_end_grid = """                    })}
                  </div>
                  
                  {standaloneRecs.length > 0 && (
                    <div className="mt-10">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-black text-slate-800">التوصيات المباشرة (خارج الاجتماعات)</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {standaloneRecs.map((rec: any, idx: number) => {
                          const statusStr = rec.status || "جديدة";
                          let badgeBg = "bg-blue-50 text-blue-700 border-blue-200";
                          let statusTextLabel = "توصية جديدة";

                          if (statusStr.includes("منجز") || statusStr.includes("مكتمل") || statusStr === "منجزة") {
                            badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
                            statusTextLabel = "توصية منجزة";
                          } else if (statusStr.includes("متأخر")) {
                            badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
                            statusTextLabel = "توصية متأخرة";
                          } else if (statusStr.includes("جاري")) {
                            badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
                            statusTextLabel = "جاري العمل عليها";
                          }

                          const approvalStagesList = ["أخصائي", "رئيس قسم", "مدير الإدارة", "مكتملة"];
                          const currentStageText = rec.approvalStage || "أخصائي";
                          
                          let mappedIdx = 0;
                          if (currentStageText.includes("أخصائي")) mappedIdx = 0;
                          else if (currentStageText.includes("رئيس")) mappedIdx = 1;
                          else if (currentStageText.includes("مدير")) mappedIdx = 2;
                          else if (currentStageText.includes("مكتمل") || currentStageText.includes("منجز")) mappedIdx = 3;

                          return (
                            <motion.div
                              key={`standalone-${rec.id}`}
                              layout
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`bg-[#e8e4e4] hover:bg-[#e2dede] border border-gray-200 hover:border-brand/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between space-y-6 text-right relative`}
                            >
                              <div className="space-y-4">
                                <div className="flex items-start justify-between gap-2">
                                  <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-black rounded-lg border ${badgeBg}`}>
                                    {statusTextLabel}
                                  </span>
                                  <span className="text-[10px] text-brand font-bold bg-[#dfba6b]/10 border border-[#dfba6b]/20 px-2 py-0.5 rounded-lg">
                                    توصية مباشرة
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-sm font-black text-slate-850 leading-snug">
                                    {rec.title}
                                  </h4>
                                  <p className="text-xs text-gray-700 font-semibold leading-relaxed bg-white/75 p-4 rounded-xl border border-gray-300/60 shadow-sm min-h-[50px]">
                                    {rec.notes || rec.recommendationText || "لا يوجد وصف"}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                                  <div className="flex items-center gap-1.5 font-extrabold text-gray-700 bg-white/75 px-2.5 py-1.5 rounded-lg border border-gray-300/50 shadow-sm">
                                    <Users className="w-3.5 h-3.5 text-brand shrink-0" />
                                    <span className="truncate">المسؤول: {rec.recommendationAssignee || (rec.employees && rec.employees[0]) || "غير محدد"}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 font-extrabold text-gray-700 bg-white/75 px-2.5 py-1.5 rounded-lg border border-gray-300/50 shadow-sm font-sans">
                                    <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
                                    <span>المدة: {rec.recommendationDuration || "غير محدد"}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white/75 p-4 rounded-2.5xl border border-gray-300/60 shadow-sm space-y-3">
                                <div className="text-[10px] text-gray-500 font-extrabold flex items-center justify-between">
                                  <span>تتبع مسار الاعتماد الإداري للتوصية</span>
                                  <span className="text-brand font-black bg-[#dfba6b]/10 px-2 py-0.5 rounded-md border border-[#dfba6b]/20">
                                    المرحلة الحالية: {currentStageText}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between relative pt-1" dir="rtl">
                                  {approvalStagesList.map((st, i) => {
                                    const isPassed = i <= mappedIdx;
                                    const isCurrent = i === mappedIdx;
                                    return (
                                      <div key={st} className="flex flex-col items-center flex-1 relative z-10">
                                        <div
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                            isPassed
                                              ? "bg-brand text-[#1e293b] font-black scale-110 shadow-md ring-4 ring-brand/10"
                                              : "bg-gray-300 text-gray-500"
                                          }`}
                                        >
                                          {i + 1}
                                        </div>
                                        <span
                                          className={`text-[9px] font-extrabold mt-1.5 transition-colors ${
                                            isCurrent
                                              ? "text-brand font-black"
                                              : isPassed
                                              ? "text-slate-800 font-semibold"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {st}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  <div className="absolute top-[11px] right-[10%] left-[10%] h-0.5 bg-gray-200 -z-0 rounded-full" />
                                  <div
                                    className="absolute top-[11px] right-[10%] h-0.5 bg-brand -z-0 transition-all duration-500 rounded-full"
                                    style={{ width: `${(mappedIdx / 3) * 80}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                  {mappedIdx < 3 ? (
                                    <button
                                      onClick={() => {
                                        // This page does not support standalone rec status update via same handler easily, 
                                        // but we can route it via handleUpdateStandaloneRecommendationStatus
                                      }}
                                      className="px-3 py-1.5 bg-brand hover:bg-[#dfba6b] hover:text-[#1e293b] font-black text-[10px] rounded-lg transition text-white shadow-sm opacity-50 cursor-not-allowed"
                                    >
                                      الترقية من الجدول فقط
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-emerald-800 font-black bg-emerald-50 px-2 py-1 rounded-md border border-emerald-250">
                                      ✓ معتمدة بالكامل
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
                );
              })()}
            </div>
          ) : ("""

# Wrap the grid return with <> ... </>
target_return_grid = """                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {commEvents.map((evt) => {"""
replacement_return_grid = """                return (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {commEvents.map((evt) => {"""

content = content.replace(target_end_grid, replacement_end_grid)
content = content.replace(target_return_grid, replacement_return_grid)

with open('src/pages/CommitteesRecommendations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added standalone section successfully")
