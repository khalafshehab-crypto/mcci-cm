import re

with open('src/pages/CommitteesRecommendations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace everything from "selectedEventIdForCards === null ? (" to the end of the cards container
# Wait, let's just find the blocks using string splits.

parts = content.split(') : selectedEventIdForCards === null ? (')
if len(parts) != 2:
    print("Could not find start of Screen 2")
    exit(1)

pre = parts[0]
post = parts[1]

# Now split post by ") : (" which separates Screen 2 from Screen 3
sub_parts = post.split(') : (\n            /* Screen 3')
if len(sub_parts) != 2:
    # try another split
    sub_parts = post.split(') : (')

if len(sub_parts) < 2:
    print("Could not find start of Screen 3")
    exit(1)

screen2 = sub_parts[0]
post_screen2 = sub_parts[1]

# The end of screen 3 is matching `)}` of the main condition block.
# Let's just find where it ends.
# We can search for the end of the Main 3-Screen Drill-down Container.
end_marker = '          {/* -- End of Main Content -- */}'
# Actually we can just locate `          {/* Pagination */}` which comes after
end_parts = post.split('          {/* Pagination */}')
if len(end_parts) != 2:
    print("Could not find end marker")
    exit(1)

# Let's write the new Screen 2, and then the end_parts[1]
# Actually, the entire block is:
# {selectedCommIdForCards === null ? (
#   ... Screen 1 ...
# ) : (
#   ... New Screen 2 ...
# )}

new_screen_2 = """
            /* Screen 2: Recommendations Grid */
            <div className="space-y-6 text-right" dir="rtl">
              <div className="bg-[#e8e4e4] p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">
                      لوحة التوصيات
                    </h3>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">
                      توصيات اللجنة: {committees.find((c) => c.id === selectedCommIdForCards)?.name || ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCommIdForCards(null)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-slate-700 font-black text-xs rounded-xl border border-gray-300 transition duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <List className="w-4 h-4" />
                  <span>الرجوع للوحة اللجان الرئيسية ↑</span>
                </button>
              </div>

              {(() => {
                const commEvents = filteredEvents.filter((e) => e.committeeId === selectedCommIdForCards);

                if (commEvents.length === 0) {
                  return (
                    <div className="bg-[#e8e4e4] border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 font-bold text-sm">
                      <div className="w-16 h-16 rounded-full bg-white/70 border border-gray-300 flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      لا توجد أية توصيات مسجلة لهذه اللجنة حالياً.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {commEvents.map((rec: any, idx: number) => {
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

                      // Tracker Stages
                      const approvalStagesList = ["أخصائي", "رئيس قسم", "مدير الإدارة", "مكتملة"];
                      const currentStageText = rec.approvalStage || "أخصائي";
                      let mappedIdx = 0;
                      if (currentStageText.includes("أخصائي")) mappedIdx = 0;
                      else if (currentStageText.includes("رئيس")) mappedIdx = 1;
                      else if (currentStageText.includes("مدير")) mappedIdx = 2;
                      else if (currentStageText.includes("مكتمل") || currentStageText.includes("منجز")) mappedIdx = 3;

                      return (
                        <motion.div
                          key={rec.id || idx}
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
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-sm font-black text-slate-850 leading-snug">
                                {(() => {
                                  if (rec.recommendationClassification === "بالتمرير") return rec.title;
                                  if (rec.recommendationEventId && rec.recommendationEventId !== "unlinked") {
                                      const linkedEvent = events.find((e: any) => String(e.id) === String(rec.recommendationEventId));
                                      if (linkedEvent) return linkedEvent.title;
                                  }
                                  return rec.title;
                                })()}
                              </h4>
                              <p className="text-xs text-gray-700 font-semibold leading-relaxed bg-white/75 p-4 rounded-xl border border-gray-300/60 shadow-sm min-h-[50px]">
                                {rec.notes || rec.recommendationText || rec.recommendationDiscussion || "لا يوجد وصف"}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                              <div className="flex items-center gap-1.5 font-extrabold text-gray-700 bg-white/75 px-2.5 py-1.5 rounded-lg border border-gray-300/50 shadow-sm">
                                <Users className="w-3.5 h-3.5 text-brand shrink-0" />
                                <span className="truncate">المكلف: {rec.recommendationAssignee || (rec.employees && rec.employees[0]) || "غير محدد"}</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-extrabold text-gray-700 bg-white/75 px-2.5 py-1.5 rounded-lg border border-gray-300/50 shadow-sm font-sans">
                                <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
                                <span>المدة: {rec.recommendationDuration || "5 أيام عمل"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Stepper Approval tracking */}
                          <div className="bg-white/75 p-4 rounded-2.5xl border border-gray-300/60 shadow-sm space-y-3">
                            <div className="text-[10px] text-gray-500 font-extrabold flex items-center justify-between">
                              <span>مسار الاعتماد للتوصية</span>
                              <span className="text-brand font-black bg-[#dfba6b]/10 px-2 py-0.5 rounded-md border border-[#dfba6b]/20">
                                {currentStageText}
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
                              {/* Connector line */}
                              <div className="absolute top-[11px] right-[10%] left-[10%] h-0.5 bg-gray-200 -z-0 rounded-full" />
                              <div
                                className="absolute top-[11px] right-[10%] h-0.5 bg-brand -z-0 transition-all duration-500 rounded-full"
                                style={{ width: `${(mappedIdx / 3) * 80}%` }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
"""

new_content = pre + ") : (\n" + new_screen_2 + "\n          )}\n          {/* Pagination */}" + end_parts[1]

# Need to replace selectedEventIdForCards usage in Screen 1 if any, but it's safe to keep the state.

with open('src/pages/CommitteesRecommendations.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replaced Screen 2 and 3 successfully")
