const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const additionalStates = `
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [importedMembers, setImportedMembers] = useState<{member: any, isDuplicate: boolean, selected: boolean}[]>([]);

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        
        const rows = text.split('\\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
        if (rows.length < 2) {
          alert('الملف فارغ أو غير صالح.');
          return;
        }
        
        const headers = rows[0];
        let newImportedList: {member: any, isDuplicate: boolean, selected: boolean}[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length !== headers.length) continue;
          if (!row[0] && !row[1]) continue;
          
          const newMember: any = {
            title: "الأستاذ",
            customTitle: "",
            name: "",
            role: "عضو",
            committeeId: 0,
            committeeName: "غير محدد",
            joiningMechanism: "مرشح",
            govAgency: "",
            entity: "",
            email: "",
            phone: "",
            nationalId: "",
            active: true,
            joinedDate: new Date().toISOString().split('T')[0],
            note: "مستورد من ملف",
            personalPhoto: ""
          };
          
          headers.forEach((h, idx) => {
            const val = row[idx];
            if (!val) return;
            if (h === "اللقب") newMember.title = val;
            if (h === "اسم العضو") newMember.name = val;
            if (h === "اللجنة") newMember.committeeName = val;
            if (h === "الصفة") newMember.role = val;
            if (h === "رقم الجوال") newMember.phone = val;
            if (h === "البريد الإلكتروني") newMember.email = val;
            if (h === "رقم الهوية") newMember.nationalId = val;
            if (h === "آلية الانضمام") newMember.joiningMechanism = val;
            if (h === "تاريخ الانضمام") newMember.joinedDate = val;
            if (h === "حالة العضوية") newMember.active = val.includes("نشط") || val === "فعالة";
            if (h === "ملاحظات") newMember.note = val;
          });
          
          if (newMember.name) {
            const duplicate = members.find(m => m.name === newMember.name && m.committeeName === newMember.committeeName);
            newImportedList.push({
              member: newMember,
              isDuplicate: !!duplicate,
              selected: !duplicate
            });
          }
        }
        
        if (newImportedList.length > 0) {
          setImportedMembers(newImportedList);
          setImportPreviewOpen(true);
          setIsExportOpen(false);
        } else {
          alert('لم يتم العثور على أعضاء صالحين في الملف.');
        }
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء قراءة الملف.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmCSVImport = async () => {
    let importedCount = 0;
    for (const item of importedMembers) {
      if (item.selected) {
        // find committee if possible
        const comm = committees.find(c => c.name === item.member.committeeName);
        if (comm) {
          item.member.committeeId = comm.id;
        }
        await addFirebaseMember(item.member);
        importedCount++;
      }
    }
    setImportPreviewOpen(false);
    showGlobalToast(\`تم استيراد \${importedCount} عضو بنجاح.\`);
  };
`;

if (!code.includes('importPreviewOpen')) {
  code = code.replace(
    /const handleExportToGoogleSheets = async \(\) => \{/,
    `${additionalStates}\n  const handleExportToGoogleSheets = async () => {`
  );
}

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Added CSV import logic");
