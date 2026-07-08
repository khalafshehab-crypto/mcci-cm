const fs = require('fs');

const filesToPatch = [
  'src/pages/CommitteesEvents.tsx',
  'src/pages/Events.tsx',
  'src/pages/CommitteesRecommendations.tsx',
  'src/pages/Recommendations.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Check which state it uses for deleting
  if (content.includes('const handleBulkDelete')) {
      const stateVar = content.match(/const \[isBulkDeleting, setIsBulkDeleting\] = useState\(false\);/);
      if (stateVar) {
        content = content.replace(
          'const [isBulkDeleting, setIsBulkDeleting] = useState(false);',
          'const [isBulkDeleting, setIsBulkDeleting] = useState(false);\n  const [isBulkDeletingLoading, setIsBulkDeletingLoading] = useState(false);'
        );
      }

      const confirmRegex = /const handleBulkDelete = \(\) => \{\s+if \(selectedEventIds\.length > 0\) \{\s+setEvents\(events\.filter\(\(e\) => !selectedEventIds\.includes\(e\.id\)\)\);\s+setSelectedEventIds\(\[\]\);\s+setIsBulkDeleting\(false\);\s+\}\s+\};/;
      
      const newConfirm = `const handleBulkDelete = async () => {
    if (selectedEventIds.length > 0) {
      setIsBulkDeletingLoading(true);
      const itemsToDelete = events.filter((e) => selectedEventIds.includes(e.id));
      await Promise.all(itemsToDelete.map(e => deleteFirebaseEvent(String(e.id))));
      setSelectedEventIds([]);
      setIsBulkDeletingLoading(false);
      setIsBulkDeleting(false);
    }
  };`;
      if (content.match(confirmRegex)) {
        content = content.replace(confirmRegex, newConfirm);
      }

      // Update button in modal
      const oldBtn = `<button
                   onClick={handleBulkDelete}
                   className="flex-1 bg-rose-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                 >
                   نعم، احذف
                 </button>`;
      const newBtn = `<button
                   onClick={handleBulkDelete}
                   disabled={isBulkDeletingLoading}
                   className="flex-1 bg-rose-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center"
                 >
                   {isBulkDeletingLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   ) : (
                      "نعم، احذف"
                   )}
                 </button>`;
      content = content.replace(oldBtn, newBtn);
  }
  
  if (file.includes('Recommendations')) {
      // Recommendations uses handleDeleteSelected
      const stateVar = content.match(/const \[isBulkDeleting, setIsBulkDeleting\] = useState\(false\);/);
      if (stateVar && !content.includes('isBulkDeletingLoading')) {
        content = content.replace(
          'const [isBulkDeleting, setIsBulkDeleting] = useState(false);',
          'const [isBulkDeleting, setIsBulkDeleting] = useState(false);\n  const [isBulkDeletingLoading, setIsBulkDeletingLoading] = useState(false);'
        );
      }
      
      const recRegex = /const handleBulkDelete = \(\) => \{\s+if \(selectedEventIds\.length > 0\) \{\s+setRecommendations\(recommendations\.filter\(\(e\) => !selectedEventIds\.includes\(e\.id\)\)\);\s+setSelectedEventIds\(\[\]\);\s+setIsBulkDeleting\(false\);\s+\}\s+\};/;
      
      const newRec = `const handleBulkDelete = async () => {
    if (selectedEventIds.length > 0) {
      setIsBulkDeletingLoading(true);
      const itemsToDelete = recommendations.filter((e) => selectedEventIds.includes(e.id));
      await Promise.all(itemsToDelete.map(e => deleteFirebaseRecommendation(String(e.id))));
      setSelectedEventIds([]);
      setIsBulkDeletingLoading(false);
      setIsBulkDeleting(false);
    }
  };`;
      if (content.match(recRegex)) {
        content = content.replace(recRegex, newRec);
      }
      
      const oldBtn2 = `<button
                   onClick={handleBulkDelete}
                   className="flex-1 bg-rose-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                 >
                   نعم، احذف
                 </button>`;
      const newBtn2 = `<button
                   onClick={handleBulkDelete}
                   disabled={isBulkDeletingLoading}
                   className="flex-1 bg-rose-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center"
                 >
                   {isBulkDeletingLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   ) : (
                      "نعم، احذف"
                   )}
                 </button>`;
      content = content.replace(oldBtn2, newBtn2);
  }

  fs.writeFileSync(file, content);
}
console.log("Patched all bulk deletes.");
