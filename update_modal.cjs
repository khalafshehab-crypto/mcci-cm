const fs = require('fs');

const content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const targetFunctionStart = `function CommitteeDetailsModalContent({ detailsComm, setDetailsComm, handleOpenEdit, handleOpenDelete, dbMembers, dbEvents, dbRecs }: any) {`;

const targetRegex = new RegExp(`function CommitteeDetailsModalContent\\({ detailsComm.*?return \\(.*?</motion\\.div>\\s+</div>\\s+\\);\\s+}`, 's');

const replacement = `function CommitteeDetailsModalContent({ detailsComm, setDetailsComm, handleOpenEdit, handleOpenDelete, dbMembers, dbEvents, dbRecs }: any) {
  const getStatusColor = (status: string) => {
    if (status === "مكتمل" || status === "منجزة" || status === "مؤكد") return "bg-emerald-50 text-emerald-700 border-emerald-200 border-l-4 border-l-emerald-700";
    if (status === "متأخر" || status === "متأخرة" || status === "ملغي") return "bg-rose-50 text-rose-700 border-rose-200 border-l-4 border-l-rose-700";
    if (status === "جاري" || status === "جاري العمل عليها") return "bg-amber-50 text-amber-700 border-amber-200 border-l-4 border-l-amber-700";
    return "bg-blue-50 text-blue-700 border-blue-200 border-l-4 border-l-blue-700";
  };
  
  const [activeTab, setActiveTab] = React.useState<"overview" | "members" | "events" | "recommendations">("overview");

  const commMembers = (dbMembers || []).filter((m: any) => String(m.committeeId) === String(detailsComm.id) || advancedMatch(m.committeeName, detailsComm.name));
  const commEvents = (dbEvents || []).filter((e: any) => (String(e.committeeId) === String(detailsComm.id) || advancedMatch(e.committeeName, detailsComm.name)) && !e.recommendationClassification);
  const realMeetingsCount = commEvents.filter((e: any) => e.title && e.title.includes("اجتماع")).length;
  const realEventsCount = commEvents.filter((e: any) => e.title && !e.title.includes("اجتماع")).length;

  let allRecsModal = dbRecs ? [...dbRecs] : [];
  const agendaRecsModal: any[] = [];
  (dbEvents || []).forEach((evt: any) => {
    if (evt && evt.agenda && Array.isArray(evt.agenda)) {
      evt.agenda.forEach((item: any, index: number) => {
        if (item.recommendation && item.recommendation.trim() !== "" && !item.inactiveRecommendation) {
          agendaRecsModal.push({
            id: \`custom-rec-\${evt.id}-\${item.id || index}\`,
            eventId: evt.id,
            committeeId: evt.committeeId,
            title: item.recommendation,
            committeeName: evt.committeeName || "لجنة غير محددة",
            eventName: evt.title,
            status: "جديدة"
          });
        }
      });
    }
  });
  
  const standaloneRecsModal = [];
  allRecsModal = [...allRecsModal, ...standaloneRecsModal];

  const commRecs = allRecsModal.filter((r: any) => {
     if (!r) return false;
     const belongsByName = advancedMatch(r.committeeName || r.dept, detailsComm.name);
     const belongsById = String(r.committeeId) === String(detailsComm.id);
     const ev = (dbEvents || []).find((e: any) => String(e.id) === String(r.eventId) || (r.eventName && e.title === r.eventName));
     const belongsViaEvent = ev && (String(ev.committeeId) === String(detailsComm.id) || advancedMatch(ev.committeeName, detailsComm.name));
     return belongsByName || belongsById || belongsViaEvent;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 15, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-gray-150 relative overflow-hidden z-10 text-right font-sans h-[90vh] flex flex-col"
      >
        <div className="bg-[#e8e4e4] px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand/10 text-brand rounded-xl">
                <Users2 className="w-6 h-6 text-brand" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
                    {detailsComm.name}
                  </h3>
                  <span className={\`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black \${
                    detailsComm.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }\`}>
                    <span className={\`w-1.5 h-1.5 rounded-full \${detailsComm.active ? "bg-emerald-500" : "bg-rose-500"}\`}></span>
                    {detailsComm.active ? "نشطة" : "غير نشطة"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1">تاريخ التشكيل: يتم اعتماده من اللجنة التنفيذية (المرجع الشامل للجنة)</p>
              </div>
            </div>
            <button
              onClick={() => setDetailsComm(null)}
              className="p-2 hover:bg-white/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <button 
              onClick={() => setActiveTab("overview")}
              className={\`px-4 py-2 rounded-xl text-xs font-black transition-all \${activeTab === "overview" ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:bg-white/50"}\`}
            >
              نظرة عامة
            </button>
            <button 
              onClick={() => setActiveTab("members")}
              className={\`px-4 py-2 rounded-xl text-xs font-black transition-all \${activeTab === "members" ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:bg-white/50"}\`}
            >
              الأعضاء ({commMembers.length})
            </button>
            <button 
              onClick={() => setActiveTab("events")}
              className={\`px-4 py-2 rounded-xl text-xs font-black transition-all \${activeTab === "events" ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:bg-white/50"}\`}
            >
              الفعاليات والأعمال ({commEvents.length})
            </button>
            <button 
              onClick={() => setActiveTab("recommendations")}
              className={\`px-4 py-2 rounded-xl text-xs font-black transition-all \${activeTab === "recommendations" ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:bg-white/50"}\`}
            >
              التوصيات ({commRecs.length})
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
          
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="space-y-2 text-right">
                <h4 className="text-xs font-black text-gray-400 tracking-wider">وصف اللجنة ومسؤولياتها الرئيسية</h4>
                <div className="bg-[#fcfbfb] border border-[#d2cece] rounded-2xl p-4 text-sm font-medium text-gray-800 leading-relaxed shadow-inner">
                  {detailsComm.desc || "لم يتم إدخال وصف تفصيلي للجنة بعد."}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between text-right shadow-sm">
                  <div>
                    <Users className="w-5 h-5 text-blue-600 mb-2" />
                    <span className="text-[10px] text-gray-400 font-black block leading-tight">أعضاء اللجنة</span>
                  </div>
                  <span className="text-xl font-black text-gray-900 font-mono mt-2">{commMembers.length}</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between text-right shadow-sm">
                  <div>
                    <FileText className="w-5 h-5 text-purple-600 mb-2" />
                    <span className="text-[10px] text-gray-400 font-black block leading-tight">الفعاليات</span>
                  </div>
                  <span className="text-xl font-black text-purple-700 font-mono mt-2">{commEvents.length}</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between text-right shadow-sm">
                  <div>
                    <CheckCircle className="w-5 h-5 text-emerald-600 mb-2" />
                    <span className="text-[10px] text-gray-400 font-black block leading-tight">التوصيات</span>
                  </div>
                  <span className="text-xl font-black text-emerald-700 font-mono mt-2">{commRecs.length}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h5 className="text-xs font-black text-gray-500 border-b border-gray-100 pb-2">قيادات اللجنة</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-black block">رئيس اللجنة</span>
                      <span className="text-xs font-extrabold text-blue-900">{detailsComm.president || "-"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-black block">نائب رئيس اللجنة</span>
                      <span className="text-xs font-extrabold text-purple-900">{detailsComm.vicePresident || "-"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-gray-650 rounded-xl">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-black block">الموظف الأخصائي المسؤول</span>
                      <span className="text-xs font-extrabold text-gray-800">{detailsComm.specialist || "غير محدد"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-gray-400 tracking-wider mb-2">جميع الأعضاء المسجلين</h4>
              {commMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {commMembers.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {m.personalPhoto ? <img src={m.personalPhoto} className="w-full h-full object-cover" /> : <UserCheck className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-brand font-black block">{m.role}</span>
                        <span className="text-xs font-extrabold text-gray-800">{m.title} {m.name}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{m.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-8 bg-white rounded-2xl border border-gray-200">لا يوجد أعضاء مسجلين لهذه اللجنة حتى الآن.</div>
              )}
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-gray-400 tracking-wider mb-2">سجل الفعاليات (اجتماعات، لقاءات، إلخ)</h4>
              {commEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {commEvents.map((e: any) => (
                    <div key={e.id} className={\`bg-white p-4 rounded-xl border flex flex-col gap-3 shadow-sm \${getStatusColor(e.status)}\`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-gray-800 leading-snug">{e.title}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                            <Calendar className="w-3 h-3" />
                            <span>{e.date} | {e.time}</span>
                          </div>
                        </div>
                        <span className={\`text-[10px] font-black px-2 py-1 rounded border whitespace-nowrap \${getStatusColor(e.status)}\`}>
                          {e.status || "مجدول"}
                        </span>
                      </div>
                      {e.desc && <p className="text-[10px] text-gray-500 line-clamp-2">{e.desc}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-8 bg-white rounded-2xl border border-gray-200">لا يوجد فعاليات أو أعمال مسجلة.</div>
              )}
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-gray-400 tracking-wider mb-2">سجل التوصيات</h4>
              {commRecs.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {commRecs.map((r: any) => (
                    <div key={r.id} className={\`bg-white p-4 rounded-xl border flex flex-col gap-3 shadow-sm \${getStatusColor(r.status)}\`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <span className="text-xs font-bold text-gray-800">{r.title || r.description}</span>
                          <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                            {r.date && (
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {r.date}</span>
                            )}
                            {r.eventName && (
                              <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded"><FileText className="w-3 h-3" /> {r.eventName}</span>
                            )}
                          </div>
                        </div>
                        <span className={\`text-[10px] font-black px-2 py-1 rounded border whitespace-nowrap shrink-0 \${getStatusColor(r.status)}\`}>
                          {r.status || "جديدة"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-8 bg-white rounded-2xl border border-gray-200">لا يوجد توصيات مسجلة لهذه اللجنة.</div>
              )}
            </div>
          )}

        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                handleOpenEdit(detailsComm);
                setDetailsComm(null);
              }}
              className="h-10 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>تعديل التفاصيل</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleOpenDelete(detailsComm);
                setDetailsComm(null);
              }}
              className="h-10 px-4 bg-red-50 text-red-650 hover:bg-red-100 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف اللجنة</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setDetailsComm(null)}
            className="px-5 h-10 bg-gray-200 hover:bg-gray-300 text-gray-750 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </motion.div>
    </div>
  );
}`;

const newContent = content.replace(targetRegex, replacement);

if (newContent !== content) {
    fs.writeFileSync('src/pages/CommitteesFormation.tsx', newContent);
    console.log("Success");
} else {
    console.log("No match found");
}

