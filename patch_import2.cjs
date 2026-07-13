const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// Replace the dummy logic in handleImportCSV with actual adding
const newImportLogic = `
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        
        // Simple CSV parser (assuming comma separated and no internal commas)
        const rows = text.split('\\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
        if (rows.length < 2) {
          alert('الملف فارغ أو غير صالح.');
          return;
        }

        const headers = rows[0];
        let importedCount = 0;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length !== headers.length) continue;
          if (!row[0] && !row[1]) continue; // skip empty rows

          const newComm: any = {
            name: 'لجنة مستوردة',
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
            if (!val) return;
            if (h === "اسم اللجنة") newComm.name = val;
            if (h === "رئيس اللجنة") newComm.president = val;
            if (h === "أخصائي اللجنة") newComm.specialist = val;
            if (h === "عدد الأعضاء") newComm.membersCount = parseInt(val) || 0;
            if (h === "عدد الاجتماعات") newComm.meetingsCount = parseInt(val) || 0;
            if (h === "التوصيات") newComm.recommendationsCount = parseInt(val) || 0;
            if (h === "الفعاليات والأعمال") newComm.eventsCount = parseInt(val) || 0;
            if (h === "قضايا التقدير") newComm.ratingIssues = val;
            if (h === "الخطة الاستراتيجية المعتمدة") newComm.strategicPlan = val;
            if (h === "حالة اللجنة") newComm.active = val.includes("فعالة") || val.includes("نشطة");
            if (h === "ملاحظات إضافية") newComm.notes = val;
            if (h === "وصف اللجنة") newComm.desc = val;
          });

          if (newComm.name && newComm.name !== 'لجنة مستوردة') {
            await addFirebaseComm(newComm);
            importedCount++;
          }
        }
        
        alert(\`تم استيراد \${importedCount} لجنة بنجاح.\`);
        setIsExportOpen(false);
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء قراءة أو استيراد الملف.');
      }
    };
    reader.readAsText(file);
  };
`;

code = code.replace(
  /const handleImportCSV = [\s\S]*?reader\.readAsText\(file\);\n  };/,
  newImportLogic.trim()
);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
