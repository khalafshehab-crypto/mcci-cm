const fs = require('fs');

const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const oldImport = `const { data: allDbRecommendations, addDocument: addFirebaseRecommendation, deleteDocument: deleteFirebaseRecommendation } = useFirestoreCollection<any>("recommendations", []);`;
  const newImport = `const { data: allDbRecommendations, addDocument: addFirebaseRecommendation, updateDocument: updateFirebaseRecommendation, deleteDocument: deleteFirebaseRecommendation } = useFirestoreCollection<any>("recommendations", []);`;
  code = code.replace(oldImport, newImport);
  
  const oldAdd = `      if (editingEvent.isAgendaSource || String(editingEvent.id).startsWith("custom-rec-")) {
        // Save to Firebase for agenda exported recommendations
        addFirebaseRecommendation(updatedRec);
      }`;
  const newUpdate = `      if (editingEvent.isAgendaSource || String(editingEvent.id).startsWith("custom-rec-")) {
        // Save to Firebase for agenda exported recommendations
        updateFirebaseRecommendation(editingEvent.id, updatedRec);
      }`;
  code = code.replace(oldAdd, newUpdate);
  
  fs.writeFileSync(filename, code);
  console.log("Patched CommitteesRecommendations.tsx (updateFirebaseRecommendation)");
}
