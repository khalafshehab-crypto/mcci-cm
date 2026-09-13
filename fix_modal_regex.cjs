const fs = require('fs');

const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace State
  const stateRegex = /const \[eventsToSync, setEventsToSync\] = useState<any\[\]>\(\[\]\);/;
  if (stateRegex.test(code) && !code.includes('selectedEventsToSync')) {
     code = code.replace(stateRegex, `const [eventsToSync, setEventsToSync] = useState<any[]>([]);\n  const [selectedEventsToSync, setSelectedEventsToSync] = useState<number[]>([]);`);
  }

  // Replace Logic
  const logicRegex = /const handleManualSync = \(\) => \{[\s\S]*?showGlobalToast\("لا توجد مواعيد جديدة للمزامنة\.", "info"\);\n\s*\}\n\s*\};/;
  const newLogic = `const handleManualSync = () => {
    // Determine allowed events
    let allowedEvents = events;
    if (file === 'src/pages/CommitteesEvents.tsx' || file.includes('Committees')) {
       // Make sure we have a safe fallback if canUserEditCommittee fails or rejects all
       allowedEvents = events.filter((e: any) => {
         try {
           return canUserEditCommittee(e.committeeName);
         } catch(err) { return true; }
       });
       // If empty for some reason, just show all for the current section to avoid getting stuck
       if (allowedEvents.length === 0 && currentUserRole === "مدير النظام") {
          allowedEvents = events;
       }
    }
    setEventsToSync(allowedEvents);
    setSelectedEventsToSync(allowedEvents.map((e: any) => e.id));
    setIsSyncModalOpen(true);
  };

  const confirmManualSync = async () => {
    setIsSyncing(true);
    const currentCollectionName = "${file.includes('Committees') ? 'events' : file.includes('Centers') ? 'centers_events' : file.includes('Affiliates') ? 'affiliates_events' : 'assistant_sec_gen_events'}";
    const toSync = eventsToSync.filter(e => selectedEventsToSync.includes(e.id));
    showGlobalToast("جاري مزامنة التقويم، يرجى الانتظار...", "info");
    const stats = await syncEventsToCalendar(toSync, dbEmployees, currentCollectionName);
    setIsSyncing(false);
    setIsSyncModalOpen(false);
    if (stats && (stats.created > 0 || stats.updated > 0 || stats.failed > 0)) {
      showGlobalToast(\`اكتملت المزامنة! تمت إضافة: \${stats.created}، وتحديث: \${stats.updated}، وفشل: \${stats.failed}\`, "success");
    } else {
      showGlobalToast("لا توجد مواعيد جديدة للمزامنة.", "info");
    }
  };`;
  if (logicRegex.test(code)) {
    code = code.replace(logicRegex, newLogic);
  }

  const modalRegex = /\{\/\* Sync Modal \*\/\}.*?<\/div>\n\s*<\/div>\n\s*\}/s; // matches till the end of the modal closing div
  
  const newModalUI = `{/* Sync Modal */}
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
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-800 text-sm">الفعاليات التي سيتم مزامنتها ({eventsToSync.length}):</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-bold text-gray-600">تحديد الكل</span>
                      <input 
                        type="checkbox" 
                        checked={selectedEventsToSync.length === eventsToSync.length && eventsToSync.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedEventsToSync(eventsToSync.map(ev => ev.id));
                          else setSelectedEventsToSync([]);
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="space-y-2">
                    {eventsToSync.map(evt => (
                        <label key={evt.id} className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 rounded-xl flex justify-between items-center cursor-pointer">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox"
                              checked={selectedEventsToSync.includes(evt.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedEventsToSync([...selectedEventsToSync, evt.id]);
                                else setSelectedEventsToSync(selectedEventsToSync.filter(id => id !== evt.id));
                              }}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <div>
                                <p className="text-sm font-bold text-gray-800">{evt.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{evt.date} | {evt.time}</p>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {evt.type}
                          </div>
                        </label>
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
                disabled={isSyncing || selectedEventsToSync.length === 0}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>تأكيد المزامنة ({selectedEventsToSync.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}`;

  // Find exact index of "{/* Sync Modal */}" to end of file, and we will replace until we see the ")" that closes it.
  const startIndex = code.indexOf('{/* Sync Modal */}');
  if (startIndex !== -1) {
    const isAddOpenIndex = code.indexOf('{isAddOpen && (', startIndex);
    if (isAddOpenIndex !== -1) {
        code = code.substring(0, startIndex) + newModalUI + '\n      ' + code.substring(isAddOpenIndex);
        fs.writeFileSync(file, code);
        console.log("Updated in", file);
    }
  }

}
