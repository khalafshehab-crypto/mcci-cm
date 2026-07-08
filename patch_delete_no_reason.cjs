const fs = require('fs');

['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'].forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');

  // Replace handleDelete to remove reason check
  const newHandleDelete = `const handleDelete = async () => {
    if (deletingEvent) {
      if (allDbRecommendations.some((r: any) => String(r.id) === String(deletingEvent.id))) {
        if (typeof deleteFirebaseRecommendation === "function") {
          await deleteFirebaseRecommendation(String(deletingEvent.id));
        }
      } else if (deletingEvent.isAgendaSource) {
        alert("هذه التوصية مستمدة من جدول أعمال فعالية. لا يمكن حذفها من هنا.");
        setDeletingEvent(null);
        return;
      } else {
        if (typeof deleteFirebaseEvent === "function") {
          await deleteFirebaseEvent(String(deletingEvent.id));
        }
      }
      
      setEvents(events.filter((e) => e.id !== deletingEvent.id));
      setDeletingEvent(null);
    }
  };`;
  
  // Need to replace the current handleDelete which has deleteReason
  const handleDeleteRegex = /const handleDelete = async \(\) => \{\s*if \(deletingEvent\) \{\s*if \(!deleteReason\.trim\(\)\)[\s\S]*?setDeleteReason\(""\);\s*\}\s*\};/m;
  content = content.replace(handleDeleteRegex, newHandleDelete);

  // Update modal to remove textarea
  const oldModal = /<p className="text-sm font-bold text-gray-500 mb-4">[\s\S]*?<\/textarea>\s*<\/div>/m;
  const newModal = `<p className="text-sm font-bold text-gray-500 mb-6">
                 هل أنت متأكد من حذف التوصية "{deletingEvent.title}"؟ 
                 لن يتم حذف الفعالية الأصلية.
               </p>`;
  content = content.replace(oldModal, newModal);
  
  // Remove setDeleteReason from cancel button
  content = content.replace(
    /onClick=\{\(\) => \{ setDeletingEvent\(null\); setDeleteReason\(""\); \}\}/g,
    'onClick={() => setDeletingEvent(null)}'
  );

  fs.writeFileSync(filepath, content, 'utf8');
});
console.log('Patched delete logic in both files to remove reason');
