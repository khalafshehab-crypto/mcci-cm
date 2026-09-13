const fs = require('fs');

const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // 1. Replace state and handlers
  const currentCollectionName = file.includes('Committees') ? 'events' : file.includes('Centers') ? 'centers_events' : file.includes('Affiliates') ? 'affiliates_events' : 'assistant_sec_gen_events';
  
  const newLogic = `const [isSyncing, setIsSyncing] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [eventsToSync, setEventsToSync] = useState<any[]>([]);

  const handleManualSync = () => {
    const allowedEvents = events.filter((e: any) => canUserEditCommittee(e.committeeName));
    setEventsToSync(allowedEvents);
    setIsSyncModalOpen(true);
  };

  const confirmManualSync = async () => {
    setIsSyncing(true);
    const currentCollectionName = "${currentCollectionName}";
    showGlobalToast("جاري مزامنة التقويم، يرجى الانتظار...", "info");
    const stats = await syncEventsToCalendar(eventsToSync, dbEmployees, currentCollectionName);
    setIsSyncing(false);
    setIsSyncModalOpen(false);
    if (stats && (stats.created > 0 || stats.updated > 0 || stats.failed > 0)) {
      showGlobalToast(\`اكتملت المزامنة! تمت إضافة: \${stats.created}، وتحديث: \${stats.updated}، وفشل: \${stats.failed}\`, "success");
    } else {
      showGlobalToast("لا توجد مواعيد جديدة للمزامنة.", "info");
    }
  };`;

  const logicRegex = /const \[isSyncing, setIsSyncing\] = useState\(false\);[\s\S]*?showGlobalToast\("لا توجد مواعيد جديدة للمزامنة\.", "info"\);\n\s*\}\n\s*\};/;
  if (logicRegex.test(code)) {
    code = code.replace(logicRegex, newLogic);
  } else {
     console.log("Could not find logic to replace in", file);
  }

  // 2. Inject Modal UI
  const modalUI = `
      {/* Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                تأكيد مزامنة التقويم
              </h3>
              <button onClick={() => setIsSyncModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="mb-4">
                  <h4 className="font-bold text-gray-800 text-sm mb-2">اللجان المشمولة بالمزامنة (حسب صلاحياتك):</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(eventsToSync.map(e => e.committeeName))).map((cName: any) => (
                        <span key={cName} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">{cName || 'عام'}</span>
                    ))}
                    {eventsToSync.length === 0 && (
                      <span className="text-xs text-gray-500">لا يوجد لجان مطابقة</span>
                    )}
                  </div>
              </div>
              
              <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-2">الفعاليات التي سيتم مزامنتها ({eventsToSync.length}):</h4>
                  <div className="space-y-2">
                    {eventsToSync.map(evt => (
                        <div key={evt.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center">
                          <div>
                              <p className="text-sm font-bold text-gray-800">{evt.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{evt.date} | {evt.time}</p>
                          </div>
                          <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {evt.type}
                          </div>
                        </div>
                    ))}
                    {eventsToSync.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">لا توجد فعاليات ضمن صلاحياتك لمزامنتها.</p>
                    )}
                  </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex gap-3 justify-end">
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmManualSync}
                disabled={isSyncing || eventsToSync.length === 0}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>تأكيد المزامنة</span>
              </button>
            </div>
          </div>
        </div>
      )}
  `;

  if (!code.includes('تأكيد مزامنة التقويم')) {
     code = code.replace('{isAddOpen && (', modalUI + '\n      {isAddOpen && (');
     fs.writeFileSync(file, code);
     console.log("Updated UI in", file);
  }
}
