import re

with open('src/pages/CommitteesRecommendations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We can just use a regex substitution to be safe!
pattern = re.compile(r'\s*\)\s*:\s*\(\s*/\*\s*Screen 2: Recommendations Grid\s*\*/.*?/\*\s*TABLE REGISTER VIEW LAYOUT', re.DOTALL)

original_screens = """) : selectedEventIdForCards === null ? (
            /* Screen 2: List of Meetings inside Selected Committee */
            <div className="space-y-6 text-right" dir="rtl">
              <div className="bg-[#e8e4e4] p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">
                      الاجتماعات المسجلة
                    </h3>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">
                      اللجنة: {committees.find((c) => c.id === selectedCommIdForCards)?.name || ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCommIdForCards(null)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-slate-700 font-black text-xs rounded-xl border border-gray-300 transition duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <List className="w-4 h-4" />
                  <span>الرجوع للوحة اللجان</span>
                </button>
              </div>

              {(() => {
                const commEvents = events.filter((e) => e.committeeId === selectedCommIdForCards && !e.exportedRecommendationsToPage);

                if (commEvents.length === 0) {
                  return (
                    <div className="bg-[#e8e4e4] border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 font-bold text-sm">
                      <div className="w-16 h-16 rounded-full bg-white/70 border border-gray-300 flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Calendar className="w-8 h-8" />
                      </div>
                      لا توجد أية اجتماعات مسجلة لهذه اللجنة حالياً.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {commEvents.map((evt) => {
                      // Calculate recommendation count for this meeting/event
                      const dbRecommendationsCount = allDbRecommendations.filter((rec: any) =>
                        String(rec.id).startsWith(`custom-rec-${evt.id}-`) ||
                        (rec.eventName && rec.eventName === evt.title)
                      ).length;
                      const agendaCount = (evt.agenda || []).filter(
                        (g: any) => g.recommendation && g.recommendation.trim() !== ""
                      ).length;
                      const totalRecs = dbRecommendationsCount + agendaCount;

                      // Extract date and day details
                      const dayName = evt.date ? getDayNameFromDate(evt.date) : "غير محدد";
                      const dateStr = evt.date || "غير محدد";
                      const timeStr = evt.time ? formatTime12h(evt.time) : "";

                      return (
                        <motion.div
                          key={evt.id}
                          layoutId={`meet-card-${evt.id}`}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-[#e8e4e4] hover:bg-[#e2dede] border border-gray-200 hover:border-brand/40 hover:shadow-md transition-all duration-300 rounded-3xl p-6 relative flex flex-col justify-between space-y-5"
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                              <span className="inline-block px-2.5 py-1 text-[10px] font-black rounded-lg bg-white/90 text-slate-700 border border-gray-305">
                                {evt.type || "رسمي"}
                              </span>
                              <span className="inline-block px-2.5 py-1 text-[10px] font-black rounded-lg bg-brand/20 text-slate-900 border border-brand/25">
                                {evt.status || "مؤكد"}
                              </span>
                            </div>

                            <h4 className="text-sm font-black text-slate-850 leading-snug shrink-0 min-h-[40px]">
                              {(() => {
                                if (evt.recommendationClassification === "بالتمرير") return evt.title;
                                if (evt.recommendationEventId && evt.recommendationEventId !== "unlinked") {
                                    const linkedEvent = events.find(e => String(e.id) === String(evt.recommendationEventId));
                                    if (linkedEvent) return linkedEvent.title;
                                }
                                return evt.title;
                              })()}
                            </h4>

                            <div className="space-y-2 text-xs font-bold text-gray-700 bg-white/75 p-4 rounded-2xl border border-gray-300/60 shadow-sm">
                              <div className="flex items-center gap-2 text-brand">
                                <Users className="w-3.5 h-3.5" />
                                <span>المكلف: {evt.recommendationAssignee || (evt.employees && evt.employees[0]) || "غير محدد"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-gray-500" />
                                <span>اللجنة: {evt.committeeName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                <span>يوم {dayName} الموافق {dateStr}</span>
                              </div>
                              {timeStr && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                                  <span>الساعة {timeStr}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                <span>{evt.location || "القاعة الرئيسية"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-300/85 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-blue-800 bg-blue-50/90 border border-blue-200 px-3 py-1 rounded-lg">
                              {totalRecs} توصية مسجلة
                            </span>
                            <button
                              onClick={() => {
                                setSelectedEventIdForCards(evt.id);
                              }}
                              className="px-4 py-2 bg-brand text-white hover:bg-[#dfba6b] hover:text-[#1e293b] font-black text-xs rounded-xl transition duration-200 shadow-sm cursor-pointer flex items-center gap-1"
                            >
                              <span>تصفح التوصيات</span>
                              <span>←</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Screen 3: List of Recommendations inside Selected Event */
            <div className="space-y-6 text-right" dir="rtl">
              {(() => {
                const chosenEvent = events.find((e) => e.id === selectedEventIdForCards);
                if (!chosenEvent) {
                  return (
                    <div className="bg-[#e8e4e4] border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 font-bold text-sm">
                      تعذر العثور على بيانات الفعالية المحددة.
                    </div>
                  );
                }

                // Gather recommendations
                const dbRecommendations = allDbRecommendations.filter((rec: any) =>
                  String(rec.id).startsWith(`custom-rec-${selectedEventIdForCards}-`) ||
                  (rec.eventName && rec.eventName === chosenEvent.title)
                );

                const agendaRecs = (chosenEvent.agenda || [])
                  .filter((g: any) => g.recommendation && g.recommendation.trim() !== "")
                  .map((g: any, idx: number) => {
                    return {
                      id: `agenda-rec-${chosenEvent.id}-${idx}`,
                      title: `توصية من: ${g.topic || "بند جدول أعمال"}`,
                      description: g.recommendation,
                      assignedTo: g.assignee || "غير محدد",
                      duration: g.durationRec || "غير محدد",
                      status: "مكتملة", // usually agenda recs are completed
                      approvalStage: "مكتملة",
                      isAgendaSource: true
                    };
                  });

                const combinedRecs = [...dbRecommendations, ...agendaRecs];

                return (
                  <div className="space-y-6">
                    {/* Screen 3 Toolbar Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#e8e4e4] p-6 rounded-3xl border border-gray-200 shadow-sm">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-6 bg-brand rounded-full inline-block animate-pulse"></span>
                          <h3 className="text-base font-black text-slate-800 leading-snug">
                            توصيات: <span className="text-brand">{chosenEvent.title}</span>
                          </h3>
                        </div>
                        <p className="text-xs text-gray-600 font-bold mt-1">
                          يمكنك تتبع مسارات الاعتماد وتحديث الحالات والتواصل بشأن هذه التوصيات
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => setSelectedEventIdForCards(null)}
                          className="px-4 py-2.5 bg-white hover:bg-gray-50 text-slate-700 font-black text-xs rounded-xl border border-gray-300 transition duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <List className="w-4 h-4" />
                          <span>الرجوع للاجتماعات ↑</span>
                        </button>
                      </div>
                    </div>

                    {combinedRecs.length === 0 ? (
                      <div className="bg-[#e8e4e4] border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 font-bold text-sm">
                        <div className="w-16 h-16 rounded-full bg-white/70 border border-gray-300 flex items-center justify-center mx-auto mb-4 text-slate-400">
                          <BookOpen className="w-8 h-8" />
                        </div>
                        لا توجد توصيات مسجلة لهذا الاجتماع حالياً.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {combinedRecs.map((rec: any, idx: number) => {
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
                              {/* Card Header & Badges */}
                              <div className="space-y-4">
                                <div className="flex items-start justify-between gap-2">
                                  <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-black rounded-lg border ${badgeBg}`}>
                                    {statusTextLabel}
                                  </span>
                                  {rec.isAgendaSource && (
                                    <span className="text-[10px] text-brand font-bold bg-[#dfba6b]/10 border border-[#dfba6b]/20 px-2 py-0.5 rounded-lg animate-pulse">
                                      من جدول الأعمال
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-sm font-black text-slate-850 leading-snug">
                                    {rec.title}
                                  </h4>
                                  <p className="text-xs text-gray-700 font-semibold leading-relaxed bg-white/75 p-4 rounded-xl border border-gray-300/60 shadow-sm min-h-[50px]">
                                    {rec.description}
                                  </p>
                                </div>

                                {/* Assigned & Duration */}
                                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                                  <div className="flex items-center gap-1.5 font-extrabold text-gray-700 bg-white/75 px-2.5 py-1.5 rounded-lg border border-gray-300/50 shadow-sm">
                                    <Users className="w-3.5 h-3.5 text-brand shrink-0" />
                                    <span className="truncate">المسؤول: {rec.assignedTo}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 font-extrabold text-gray-700 bg-white/75 px-2.5 py-1.5 rounded-lg border border-gray-300/50 shadow-sm font-sans">
                                    <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
                                    <span>المدة: {rec.duration}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Stepper Approval tracking */}
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
                                  {/* Connector line */}
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
                                        const nextStage = approvalStagesList[mappedIdx + 1];
                                        const nextStatus = nextStage === "مكتملة" ? "منجزة" : statusStr;
                                        handleUpdateRecommendationStatus(rec.id, nextStatus, nextStage);
                                      }}
                                      className="px-3 py-1.5 bg-brand hover:bg-[#dfba6b] hover:text-[#1e293b] font-black text-[10px] rounded-lg transition text-white cursor-pointer shadow-sm"
                                    >
                                      ترقية مسار الاعتماد ←
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-emerald-800 font-black bg-emerald-50 px-2 py-1 rounded-md border border-emerald-250">
                                      ✓ معتمدة بالكامل
                                    </span>
                                  )}
                                </div>
                                {/* Audit logs trigger */}
                                <div className="pt-2 border-t border-gray-300/85">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedRecLogsId(expandedRecLogsId === rec.id ? null : rec.id)}
                                    className="text-[10px] text-gray-650 font-extrabold flex items-center gap-1 hover:text-brand"
                                  >
                                    <span>{expandedRecLogsId === rec.id ? "إخفاء السجل " : "عرض السجل  لقنوات التتبع"}</span>
                                    <Sliders className="w-3 h-3" />
                                    <span>({rec.auditLogs?.length || 0})</span>
                                  </button>
                                  {expandedRecLogsId === rec.id && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      className="bg-white border border-gray-300 rounded-xl p-3 mt-2 text-[10px] space-y-1.5 max-h-40 overflow-y-auto shadow-inner"
                                    >
                                      {(!rec.auditLogs || rec.auditLogs.length === 0) ? (
                                        <div className="text-gray-400 italic">لا توجد سجلات أرشفة بعد.</div>
                                      ) : (
                                        rec.auditLogs.map((log: any, logI: number) => (
                                          <div key={logI} className="border-b border-dashed border-gray-200 pb-1.5 last:border-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                            <div className="text-slate-800 font-bold">{log.action}</div>
                                            <div className="text-gray-500 font-semibold">{log.timestamp} | {log.user}</div>
                                          </div>
                                        ))
                                      )}
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        /* TABLE REGISTER VIEW LAYOUT"""

new_content = pattern.sub(original_screens, content)

with open('src/pages/CommitteesRecommendations.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Restored successfully")
