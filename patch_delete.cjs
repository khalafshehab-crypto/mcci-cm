const fs = require('fs');

['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'].forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');

  // 1. Add deleteReason state if not exists
  if (!content.includes('const [deleteReason, setDeleteReason]')) {
    content = content.replace(
      'const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);',
      'const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);\n  const [deleteReason, setDeleteReason] = useState("");'
    );
  }

  // 2. Replace handleDelete
  const handleDeleteRegex = /const handleDelete = \(\) => \{\s+if \(deletingEvent\) \{\s+setEvents\(events\.filter\(\(e\) => e\.id !== deletingEvent\.id\)\);\s+setDeletingEvent\(null\);\s+\}\s+\};/m;
  const newHandleDelete = `const handleDelete = async () => {
    if (deletingEvent) {
      if (!deleteReason.trim()) {
        alert("يرجى ذكر سبب الحذف لتأكيد العملية");
        return;
      }
      if (allDbRecommendations.some((r: any) => String(r.id) === String(deletingEvent.id))) {
        if (typeof deleteFirebaseRecommendation === "function") {
          await deleteFirebaseRecommendation(String(deletingEvent.id));
        }
      } else if (deletingEvent.isAgendaSource) {
        alert("هذه التوصية مستمدة من جدول أعمال فعالية. لا يمكن حذفها من هنا.");
        setDeletingEvent(null);
        setDeleteReason("");
        return;
      } else {
        if (typeof deleteFirebaseEvent === "function") {
          await deleteFirebaseEvent(String(deletingEvent.id));
        }
      }
      
      setEvents(events.filter((e) => e.id !== deletingEvent.id));
      setDeletingEvent(null);
      setDeleteReason("");
    }
  };`;
  content = content.replace(handleDeleteRegex, newHandleDelete);

  // 3. Update modal
  const oldModal = /<p className="text-sm font-bold text-gray-500 mb-6">\s*هل أنت متأكد من حذف الفعالية "\{deletingEvent\.title\}"؟\s*<\/p>/m;
  const newModal = `<p className="text-sm font-bold text-gray-500 mb-4">
                 هل أنت متأكد من حذف التوصية "{deletingEvent.title}"؟ 
                 لن يتم حذف الفعالية الأصلية.
               </p>
               <div className="mb-6 text-right w-full">
                 <label className="block text-xs font-bold text-gray-700 mb-2">سبب الحذف (إلزامي):</label>
                 <textarea
                   value={deleteReason}
                   onChange={(e) => setDeleteReason(e.target.value)}
                   className="w-full border border-gray-300 rounded-lg p-3 text-xs font-bold focus:ring-2 focus:ring-rose-500/50 outline-none resize-none"
                   rows={3}
                   placeholder="اكتب سبب حذف هذه التوصية..."
                   dir="rtl"
                 ></textarea>
               </div>`;
  content = content.replace(oldModal, newModal);
  
  // Update cancel button to clear deleteReason
  content = content.replace(
    /onClick=\{\(\) => setDeletingEvent\(null\)\}/g,
    'onClick={() => { setDeletingEvent(null); setDeleteReason(""); }}'
  );

  fs.writeFileSync(filepath, content, 'utf8');
});
console.log('Patched delete logic in both files');
