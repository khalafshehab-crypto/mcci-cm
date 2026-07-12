const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

// Fix Vice President
code = code.replace(
  '<span className="text-xs font-extrabold text-purple-900">{"vicePresident"}</span>',
  '<span className="text-xs font-extrabold text-purple-900">{detailsComm.vicePresident || "-"}</span>'
);

// Define getStatusStyles helper inside the component if needed, but it's better to inline it or add it to the top.
// Actually, let's just replace the blocks with a script that adds a helper function to CommitteeDetailsModalContent.

code = code.replace(
  'function CommitteeDetailsModalContent({ detailsComm, setDetailsComm, handleOpenEdit, handleOpenDelete, dbMembers, dbEvents, dbRecs }: any) {',
  `function CommitteeDetailsModalContent({ detailsComm, setDetailsComm, handleOpenEdit, handleOpenDelete, dbMembers, dbEvents, dbRecs }: any) {
  const getStatusColor = (status: string) => {
    if (!status) return "bg-blue-50 text-blue-700 border-blue-200";
    if (status.includes("مكتمل") || status.includes("منجز") || status.includes("مؤكد") || status.includes("تم التنفيذ")) {
       return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (status.includes("جاري") || status.includes("محجوز") || status.includes("قيد")) {
       return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (status.includes("متأخر") || status.includes("غير منجز") || status.includes("ملغي")) {
       return "bg-red-50 text-red-700 border-red-200";
    }
    return "bg-blue-50 text-blue-700 border-blue-200";
  };`
);

const eventsBlockOld = `              <div className="space-y-2">
                {commEvents.slice(0, 3).map((e: any) => (
                   <div key={e.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                     <span className="text-[11px] font-bold text-gray-800">{e.title}</span>
                     <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">{e.date}</span>
                   </div>
                ))}
                {commEvents.length === 0 && <div className="text-xs text-gray-500">لا يوجد فعاليات مسجلة</div>}
              </div>`;

const eventsBlockNew = `              <div className="space-y-2">
                {commEvents.slice(0, 5).map((e: any) => (
                   <div key={e.id} className={\`bg-white p-3 rounded-xl border flex flex-col gap-2 \${getStatusColor(e.status).replace('text-', 'border-l-4 border-l-')}\`}>
                     <div className="flex items-center justify-between">
                       <span className="text-[11px] font-bold text-gray-800">{e.title}</span>
                       <span className={\`text-[9px] font-black px-2 py-0.5 rounded border \${getStatusColor(e.status)}\`}>{e.status || "مجدول"}</span>
                     </div>
                     <span className="text-[10px] font-mono text-gray-500">{e.date}</span>
                   </div>
                ))}
                {commEvents.length === 0 && <div className="text-xs text-gray-500 text-center py-2">لا يوجد فعاليات مسجلة</div>}
              </div>`;

code = code.replace(eventsBlockOld, eventsBlockNew);

const recsBlockOld = `              <div className="space-y-2">
                {commRecs.slice(0, 3).map((r: any) => (
                   <div key={r.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                     <span className="text-[11px] font-bold text-gray-800 line-clamp-1">{r.title || r.description}</span>
                     <span className={\`text-[9px] font-black px-2 py-0.5 rounded \${r.status === 'منجزة' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}\`}>{r.status}</span>
                   </div>
                ))}
                {commRecs.length === 0 && <div className="text-xs text-gray-500">لا يوجد توصيات مسجلة</div>}
              </div>`;

const recsBlockNew = `              <div className="space-y-2">
                {commRecs.slice(0, 5).map((r: any) => (
                   <div key={r.id} className={\`bg-white p-3 rounded-xl border flex flex-col gap-2 \${getStatusColor(r.status).replace('text-', 'border-l-4 border-l-')}\`}>
                     <div className="flex items-center justify-between">
                       <span className="text-[11px] font-bold text-gray-800 line-clamp-1">{r.title || r.description}</span>
                       <span className={\`text-[9px] font-black px-2 py-0.5 rounded border \${getStatusColor(r.status)}\`}>{r.status || "جديدة"}</span>
                     </div>
                     <span className="text-[10px] font-mono text-gray-500">{r.date || "غير محدد"}</span>
                   </div>
                ))}
                {commRecs.length === 0 && <div className="text-xs text-gray-500 text-center py-2">لا يوجد توصيات مسجلة</div>}
              </div>`;

code = code.replace(recsBlockOld, recsBlockNew);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
console.log("Done patching modal UI");
