const fs = require('fs');

const pages = [
  'src/pages/CommitteesTasks.tsx'
];

pages.forEach(page => {
  let content = fs.readFileSync(page, 'utf8');
  
  // 1. Update TaskItem interface
  if (!content.includes('historyLog?: Array<{')) {
    content = content.replace(
      /escalationLevel: "لا يوجد" \| "رئيس قسم" \| "مدير الإدارة" \| "الأمين العام";/g,
      'escalationLevel: "لا يوجد" | "رئيس قسم" | "مدير الإدارة" | "مساعد الأمين العام" | "الأمين العام";\n  historyLog?: Array<{ id: string; date: string; time: string; note: string; by: string; action: string }>;'
    );
  }

  // 2. Add send states
  if (!content.includes('const [isSendOpen, setIsSendOpen] = useState(false);')) {
    content = content.replace(
      /const \[currentTask, setCurrentTask\] = useState<TaskItem \| null>\(null\);/,
      `const [currentTask, setCurrentTask] = useState<TaskItem | null>(null);\n  const [isSendOpen, setIsSendOpen] = useState(false);\n  const [sendType, setSendType] = useState<"email" | "forward">("email");\n  const [forwardAssignDept, setForwardAssignDept] = useState("إدارة اللجان");\n  const [forwardAssignTo, setForwardAssignTo] = useState("");\n  const [forwardNote, setForwardNote] = useState("");\n  const [newProgressNote, setNewProgressNote] = useState("");`
    );
  }

  // 3. Replace handleSaveAction
  if (content.includes('const handleSaveAction = async (e: FormEvent) => {') && !content.includes('action: "تحديث إنجاز"')) {
    const newHandleSaveAction = `  const handleSaveAction = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;

    let newEscLevel = currentTask.escalationLevel;
    if (status === "متأخرة" && newEscLevel === "لا يوجد") {
      newEscLevel = "رئيس قسم";
    } else if (status === "متأخرة" && newEscLevel === "رئيس قسم") {
      newEscLevel = "مدير الإدارة";
    } else if (status === "منجزة") {
      newEscLevel = "لا يوجد";
    }
    
    // Add history log for achievement update
    let updatedHistory = currentTask.historyLog || [];
    if (newProgressNote.trim() !== "") {
      const now = new Date();
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        date: now.toISOString().substring(0, 10),
        time: now.toLocaleTimeString('en-US', { hour12: false }),
        note: newProgressNote.trim(),
        by: currentUserName,
        action: "تحديث إنجاز"
      };
      updatedHistory = [...updatedHistory, newLog];
    }
    
    // We update achievementNotes if we want backward compatibility or just clear the field
    const combinedNotes = updatedHistory.filter(h => h.action === "تحديث إنجاز").map(h => h.note).join("\\n");
    
    try {
      const colName = (currentTask as any)._sourceCol || "tasks";
      await updateDoc(doc(db, colName, currentTask.id), {
        status,
        achievementNotes: combinedNotes,
        escalationLevel: newEscLevel,
        historyLog: updatedHistory
      });
      setIsActionOpen(false);
      setNewProgressNote("");
    } catch (e) {
      console.error(e);
    }
  };`;
    content = content.replace(
      /const handleSaveAction = async \(e: FormEvent\) => \{[\s\S]*?catch \(e\) \{\s*console\.error\(e\);\s*\}\s*\};/,
      newHandleSaveAction
    );
  }

  // 4. Replace handleImmediateEscalate
  if (content.includes('const handleImmediateEscalate = async (task: TaskItem) => {') && !content.includes('action: "تصعيد"')) {
    const newHandleEscalate = `  const handleImmediateEscalate = async (task: TaskItem) => {
    const levels: Array<"لا يوجد" | "رئيس قسم" | "مدير الإدارة" | "مساعد الأمين العام" | "الأمين العام"> = ["لا يوجد", "رئيس قسم", "مدير الإدارة", "مساعد الأمين العام", "الأمين العام"];
    const currentIdx = levels.indexOf(task.escalationLevel || "لا يوجد");
    const nextIdx = Math.min(currentIdx + 1, levels.length - 1);
    const nextLevel = levels[nextIdx];

    if (nextLevel !== task.escalationLevel) {
      const now = new Date();
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        date: now.toISOString().substring(0, 10),
        time: now.toLocaleTimeString('en-US', { hour12: false }),
        note: \`تم التصعيد الإداري من (\${task.escalationLevel || "لا يوجد"}) إلى (\${nextLevel})\`,
        by: currentUserName,
        action: "تصعيد"
      };
      const updatedHistory = [...(task.historyLog || []), newLog];

      try {
        const colName = (task as any)._sourceCol || "tasks";
        await updateDoc(doc(db, colName, task.id), {
          escalationLevel: nextLevel,
          status: "متأخرة",
          historyLog: updatedHistory
        });
        alert(\`تم تصعيد المتابعة الإدارية للرتبة الأعلى: (\${nextLevel}) بنجاح\`);
      } catch (e) {
        console.error(e);
      }
    }
  };`;
    content = content.replace(
      /const handleImmediateEscalate = async \(task: TaskItem\) => \{[\s\S]*?catch \(e\) \{\s*console\.error\(e\);\s*\}\s*\};/,
      newHandleEscalate
    );
  }

  // 5. Add Send Modal functions
  if (!content.includes('const handleOpenSendModal')) {
    const sendFuncs = `  const handleOpenSendModal = (task: TaskItem) => {
    setCurrentTask(task);
    setSendType("email");
    setForwardAssignDept("إدارة اللجان");
    setForwardAssignTo(employeesList[0] || "");
    setForwardNote("");
    setIsSendOpen(true);
  };

  const handleSendSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;

    if (sendType === "email") {
      const textMsg = \`مهمة معينة إليكم في نظام الغرفة التجارية بمكة المكرمة:\\n\\nعنوان المهمة: \${currentTask.title}\\nشرح المسؤولية: \${currentTask.description}\\nالحالة الحالية: \${currentTask.status}\\nتاريخ التسليم الأقصى: \${currentTask.dueDate}\\nالمُنسّق: \${currentTask.assignedBy}\\n\\nنأمل متابعتها والانتهاء ضمن الجدول الزمني منعا للتصعيد الهيكلي.\`;
      const mailto = \`mailto:?subject=\${encodeURIComponent("مهمة معلقة بالنظام: " + currentTask.title)}&body=\${encodeURIComponent(textMsg)}\`;
      window.location.href = mailto;
      setIsSendOpen(false);
    } else {
      // Forward
      const now = new Date();
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        date: now.toISOString().substring(0, 10),
        time: now.toLocaleTimeString('en-US', { hour12: false }),
        note: \`تم إحالة المهمة إلى \${forwardAssignTo}. \${forwardNote ? 'ملاحظة: ' + forwardNote : ''}\`,
        by: currentUserName,
        action: "إحالة"
      };
      const updatedHistory = [...(currentTask.historyLog || []), newLog];

      try {
        const colName = (currentTask as any)._sourceCol || "tasks";
        await updateDoc(doc(db, colName, currentTask.id), {
          assignedTo: forwardAssignTo,
          historyLog: updatedHistory
        });
        setIsSendOpen(false);
      } catch(e) {}
    }
  };`;
    content = content.replace(/const handleSendEmail = \(task: TaskItem\) => \{[\s\S]*?\};\n/, sendFuncs + '\n\n');
  }

  // 6. Replace onClick handleSendEmail with handleOpenSendModal
  content = content.replace(/onClick=\{() => handleSendEmail\(t\)\}/g, 'onClick={() => handleOpenSendModal(t)}');
  content = content.replace(/title="إرسال تذكير إلكتروني للمسؤول"/g, 'title="إرسال أو إحالة المهمة"');

  // 7. Update Action Modal (Progress update)
  if (content.includes('value={achievementNotes}') && !content.includes('value={newProgressNote}')) {
    content = content.replace(
      /value=\{achievementNotes\}\s*onChange=\{\(e\) => setAchievementNotes\(e\.target\.value\)\}/g,
      'value={newProgressNote}\n                    onChange={(e) => setNewProgressNote(e.target.value)}'
    );
    
    const historyLogRender = `
                {currentTask?.historyLog && currentTask.historyLog.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-black text-gray-700 mb-2">السجل التتبعي للمهمة</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {currentTask.historyLog.slice().reverse().map(log => (
                        <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm text-[11px]">
                          <div className="flex justify-between items-center mb-1 text-gray-500">
                            <span className="font-bold text-blue-600">{log.action} ({log.by})</span>
                            <span className="font-mono text-[9px]">{log.date} {log.time}</span>
                          </div>
                          <p className="font-semibold text-gray-800 leading-relaxed">{log.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
`;
    // Insert history log before the description area in Action Modal
    content = content.replace(
      /<div className="mb-4 text-xs font-bold text-gray-700 bg-white p-3 rounded-xl border border-gray-200">/,
      historyLogRender + '\n                <div className="mb-4 text-xs font-bold text-gray-700 bg-white p-3 rounded-xl border border-gray-200">'
    );
  }

  // 8. Add the Send Modal to the DOM
  if (!content.includes('Modal: SEND OR FORWARD')) {
    const sendModalStr = `
      {/* ========================================================================= */}
      {/* Modal: SEND OR FORWARD */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSendOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsSendOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 280 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right"
            >
              <div className="p-6 bg-gradient-to-l from-blue-50 to-white border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900 leading-tight">إرسال أو إحالة المهمة</h2>
                    <p className="text-[10px] text-gray-500 font-bold mt-0.5">اختر وسيلة الإرسال أو الإحالة</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSendOpen(false)}
                  className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendSubmit} className="p-6">
                <div className="space-y-4">
                  
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sendType" value="email" checked={sendType === "email"} onChange={() => setSendType("email")} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      <span className="text-xs font-bold text-gray-750">بريد إلكتروني خارجي</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sendType" value="forward" checked={sendType === "forward"} onChange={() => setSendType("forward")} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      <span className="text-xs font-bold text-gray-750">إحالة داخلية למوظف آخر</span>
                    </label>
                  </div>

                  {sendType === "email" ? (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
                      <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                        سيتم تجهيز رسالة بريد إلكتروني تحتوي على تفاصيل المهمة الحالية في تطبيق البريد الخاص بك.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-gray-750 mb-1">الإدارة / القسم المرجعي</label>
                        <select
                          value={forwardAssignDept}
                          onChange={(e) => {
                            setForwardAssignDept(e.target.value);
                            const deptEmps = allEmployeesData.filter(emp => emp.orgLevel3 === e.target.value || emp.orgLevel2 === e.target.value || emp.orgLevel1 === e.target.value);
                            if (deptEmps.length > 0) {
                              setForwardAssignTo(deptEmps[0].name);
                            } else {
                              setForwardAssignTo("");
                            }
                          }}
                          className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                          {Array.from(new Set(allEmployeesData.map(e => e.orgLevel3 || e.orgLevel2 || e.orgLevel1).filter(Boolean))).map((dept, i) => (
                            <option key={i} value={dept as string}>{dept as string}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-750 mb-1">الموظف المحال إليه</label>
                        <select
                          value={forwardAssignTo}
                          onChange={(e) => setForwardAssignTo(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                          {allEmployeesData.filter(emp => emp.orgLevel3 === forwardAssignDept || emp.orgLevel2 === forwardAssignDept || emp.orgLevel1 === forwardAssignDept).map((e, i) => (
                            <option key={i} value={e.name}>{e.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-750 mb-1">ملاحظة الإحالة (اختياري)</label>
                        <input
                          type="text"
                          value={forwardNote}
                          onChange={(e) => setForwardNote(e.target.value)}
                          placeholder="مثال: يرجى استكمال البيانات الناقصة"
                          className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                </div>
                
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSendOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-black transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendType === "email" ? "تجهيز البريد" : "إحالة المهمة"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;
    content = content.replace(/\{(\/\* =+\s*\*\/|\s*)\{?\/\* 3\. Modal: UPDATE ACHIEVEMENT/, sendModalStr + '\n      {/* ========================================================================= */}\n      {/* 3. Modal: UPDATE ACHIEVEMENT');
  }

  fs.writeFileSync(page, content);
});
