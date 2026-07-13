const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// Add addDocument to the hook
code = code.replace(
  `const { data: dbCommittees, updateDocument: updateFirebaseComm, deleteDocument: deleteFirebaseComm } = useFirestoreCollection<Committee>("committees", []);`,
  `const { data: dbCommittees, addDocument: addFirebaseComm, updateDocument: updateFirebaseComm, deleteDocument: deleteFirebaseComm } = useFirestoreCollection<Committee>("committees", []);`
);

// Add parse and import logic
const importLogic = `
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        
        // Simple CSV parser
        const rows = text.split('\\n').map(row => row.split(',').map(cell => cell.trim()));
        if (rows.length < 2) {
          alert('الملف فارغ أو غير صالح.');
          return;
        }

        const headers = rows[0];
        let importedCount = 0;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length !== headers.length) continue;
          if (!row[0]) continue; // skip empty rows

          // Construct committee object based on headers (we try to map them back to internal fields)
          const newComm: any = {
            name: '',
            president: 'غير محدد',
            specialist: 'غير محدد',
            membersCount: 0,
            meetingsCount: 0,
            recommendationsCount: 0,
            eventsCount: 0,
            ratingIssues: '',
            strategicPlan: '',
            status: 'فعالة',
            active: true,
            desc: '',
            notes: ''
          };

          headers.forEach((h, idx) => {
            const val = row[idx];
            // Name is usually the first column if "مسلسل" is omitted, or we need to find the column for Name.
            // Let's assume the user exports, edits, and imports back. The export doesn't currently output the Name column by default unless we add it!
            // Wait, does the export output the Name? Let's check getFieldVal.
          });
        }
        
        alert("عذراً، ميزة استيراد البيانات (الإضافة للقاعدة) قيد التطوير وسيتم تفعيلها قريباً.");
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء قراءة الملف.');
      }
    };
    reader.readAsText(file);
  };
`;

code = code.replace(
  `const handleExportToGoogleSheets = () => {`,
  importLogic + `\n  const handleExportToGoogleSheets = () => {`
);

// Replace the file input onChange
code = code.replace(
  `onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        alert("عذراً، ميزة الاستيراد قيد التطوير وسيتم تفعيلها قريباً.");
                      }
                    }}`,
  `onChange={handleImportCSV}`
);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
