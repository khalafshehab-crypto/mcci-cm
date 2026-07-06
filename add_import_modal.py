import re

with open('src/pages/AssistantSecGen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state for the import modal
modal_state = """  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<"events" | "tasks">("events");
  
  const { data: allEventsCommittees } = useFirestoreCollection<any>("events", []);
  const { data: allEventsCenters } = useFirestoreCollection<any>("centers_events", []);
  const { data: allEventsAffiliates } = useFirestoreCollection<any>("affiliates_events", []);
  
  const { data: allTasksCommittees } = useFirestoreCollection<any>("tasks", []);
  const { data: allTasksCenters } = useFirestoreCollection<any>("centers_tasks", []);
  const { data: allTasksAffiliates } = useFirestoreCollection<any>("affiliates_tasks", []);
  
  const handleImport = async (item: any, type: "event" | "task", sourceLabel: string) => {
    try {
      const newItem = { ...item, importedFrom: sourceLabel };
      delete newItem.id; // remove original id so it generates a new one
      const targetCol = type === "event" ? "assistant_sec_gen_events" : "assistant_sec_gen_tasks";
      await addDoc(collection(db, targetCol), newItem);
      alert("تم الاستيراد بنجاح!");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الاستيراد");
    }
  };"""

content = re.sub(r'const \[currentUserName, setCurrentUserName\] = useState\("مدير النظام"\);', r'const [currentUserName, setCurrentUserName] = useState("مدير النظام");\n' + modal_state, content)

# 2. Add an import button next to the role toggles
import_btn = """              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-xs font-black bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 rounded-lg transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                استيراد المواعيد والمهام
              </button>"""

# Find where to inject: after the role toggle buttons in `أدوات الفرز والتصفية المدمجة في مركز التنبيهات`
content = re.sub(
    r'(<button\s*type="button"\s*onClick=\{\(\) => setNotifUrgentFilter\(!notifUrgentFilter\)\}\s*className=\{`text-\[10px\] sm:text-xs font-black px-2\.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer select-none[^\}]*\}`\}\s*>\s*<AlertCircle className="w-3 h-3" />\s*<span>عاجل فقط</span>\s*</button>\s*</div>)',
    r'\1\n              ' + import_btn,
    content
)

# 3. Add the modal JSX at the very end before the last closing tags
modal_jsx = """      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100" dir="rtl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-brand" />
                استيراد المواعيد والمهام من الإدارات الأخرى
              </h2>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex bg-slate-100 p-1 mx-4 mt-4 rounded-xl">
              <button 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${importTab === 'events' ? 'bg-white text-brand shadow' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setImportTab('events')}
              >
                الفعاليات والاجتماعات
              </button>
              <button 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${importTab === 'tasks' ? 'bg-white text-brand shadow' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setImportTab('tasks')}
              >
                المهام الإدارية
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {importTab === 'events' && (
                <div className="space-y-6">
                  {/* Committees */}
                  <div>
                    <h3 className="font-black text-gray-800 mb-3 px-2 border-r-4 border-blue-500">إدارة اللجان</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allEventsCommittees.map((evt: any) => (
                        <div key={evt.id} className="p-3 border rounded-xl flex justify-between items-center bg-white hover:border-brand/50 transition-colors">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-900">{evt.title}</h4>
                            <p className="text-[10px] text-gray-500">{evt.date}</p>
                          </div>
                          <button onClick={() => handleImport(evt, 'event', 'إدارة اللجان')} className="px-3 py-1.5 bg-brand text-white text-[10px] font-bold rounded-lg hover:bg-brand/90 transition-colors shrink-0">
                            استيراد
                          </button>
                        </div>
                      ))}
                      {allEventsCommittees.length === 0 && <p className="text-xs text-gray-400 col-span-2">لا توجد فعاليات.</p>}
                    </div>
                  </div>
                  
                  {/* Centers */}
                  <div>
                    <h3 className="font-black text-gray-800 mb-3 px-2 border-r-4 border-emerald-500">إدارة المراكز</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allEventsCenters.map((evt: any) => (
                        <div key={evt.id} className="p-3 border rounded-xl flex justify-between items-center bg-white hover:border-brand/50 transition-colors">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-900">{evt.title}</h4>
                            <p className="text-[10px] text-gray-500">{evt.date}</p>
                          </div>
                          <button onClick={() => handleImport(evt, 'event', 'إدارة المراكز')} className="px-3 py-1.5 bg-brand text-white text-[10px] font-bold rounded-lg hover:bg-brand/90 transition-colors shrink-0">
                            استيراد
                          </button>
                        </div>
                      ))}
                      {allEventsCenters.length === 0 && <p className="text-xs text-gray-400 col-span-2">لا توجد فعاليات.</p>}
                    </div>
                  </div>
                  
                  {/* Affiliates */}
                  <div>
                    <h3 className="font-black text-gray-800 mb-3 px-2 border-r-4 border-amber-500">إدارة المنتسبين</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allEventsAffiliates.map((evt: any) => (
                        <div key={evt.id} className="p-3 border rounded-xl flex justify-between items-center bg-white hover:border-brand/50 transition-colors">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-900">{evt.title}</h4>
                            <p className="text-[10px] text-gray-500">{evt.date}</p>
                          </div>
                          <button onClick={() => handleImport(evt, 'event', 'إدارة المنتسبين')} className="px-3 py-1.5 bg-brand text-white text-[10px] font-bold rounded-lg hover:bg-brand/90 transition-colors shrink-0">
                            استيراد
                          </button>
                        </div>
                      ))}
                      {allEventsAffiliates.length === 0 && <p className="text-xs text-gray-400 col-span-2">لا توجد فعاليات.</p>}
                    </div>
                  </div>
                </div>
              )}
              
              {importTab === 'tasks' && (
                <div className="space-y-6">
                  {/* Committees */}
                  <div>
                    <h3 className="font-black text-gray-800 mb-3 px-2 border-r-4 border-blue-500">إدارة اللجان</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allTasksCommittees.map((evt: any) => (
                        <div key={evt.id} className="p-3 border rounded-xl flex justify-between items-center bg-white hover:border-brand/50 transition-colors">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-900">{evt.title}</h4>
                            <p className="text-[10px] text-gray-500">{evt.dueDate}</p>
                          </div>
                          <button onClick={() => handleImport(evt, 'task', 'إدارة اللجان')} className="px-3 py-1.5 bg-brand text-white text-[10px] font-bold rounded-lg hover:bg-brand/90 transition-colors shrink-0">
                            استيراد
                          </button>
                        </div>
                      ))}
                      {allTasksCommittees.length === 0 && <p className="text-xs text-gray-400 col-span-2">لا توجد مهام.</p>}
                    </div>
                  </div>
                  
                  {/* Centers */}
                  <div>
                    <h3 className="font-black text-gray-800 mb-3 px-2 border-r-4 border-emerald-500">إدارة المراكز</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allTasksCenters.map((evt: any) => (
                        <div key={evt.id} className="p-3 border rounded-xl flex justify-between items-center bg-white hover:border-brand/50 transition-colors">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-900">{evt.title}</h4>
                            <p className="text-[10px] text-gray-500">{evt.dueDate}</p>
                          </div>
                          <button onClick={() => handleImport(evt, 'task', 'إدارة المراكز')} className="px-3 py-1.5 bg-brand text-white text-[10px] font-bold rounded-lg hover:bg-brand/90 transition-colors shrink-0">
                            استيراد
                          </button>
                        </div>
                      ))}
                      {allTasksCenters.length === 0 && <p className="text-xs text-gray-400 col-span-2">لا توجد مهام.</p>}
                    </div>
                  </div>
                  
                  {/* Affiliates */}
                  <div>
                    <h3 className="font-black text-gray-800 mb-3 px-2 border-r-4 border-amber-500">إدارة المنتسبين</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allTasksAffiliates.map((evt: any) => (
                        <div key={evt.id} className="p-3 border rounded-xl flex justify-between items-center bg-white hover:border-brand/50 transition-colors">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-900">{evt.title}</h4>
                            <p className="text-[10px] text-gray-500">{evt.dueDate}</p>
                          </div>
                          <button onClick={() => handleImport(evt, 'task', 'إدارة المنتسبين')} className="px-3 py-1.5 bg-brand text-white text-[10px] font-bold rounded-lg hover:bg-brand/90 transition-colors shrink-0">
                            استيراد
                          </button>
                        </div>
                      ))}
                      {allTasksAffiliates.length === 0 && <p className="text-xs text-gray-400 col-span-2">لا توجد مهام.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
"""

content = content.replace('      <MeetingDetailsModal', modal_jsx + '\n      <MeetingDetailsModal')

with open('src/pages/AssistantSecGen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

