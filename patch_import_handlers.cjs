const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const handlers = `
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportError("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (data.length < 2) {
        setImportError("الملف فارغ أو لا يحتوي على صفوف بيانات.");
        return;
      }
      const columns = data[0] as string[];
      const rows = data.slice(1).filter((row: any) => row.length > 0 && row.some((c: any) => c !== undefined && c !== ""));
      setImportColumns(columns);
      setImportData(rows);
      
      const guessedMapping: Record<string, string> = {};
      columns.forEach(col => {
        const c = String(col).toLowerCase();
        if (c.includes("اسم") || c.includes("name")) guessedMapping["name"] = col;
        else if (c.includes("جوال") || c.includes("رقم") || c.includes("phone")) guessedMapping["phone"] = col;
        else if (c.includes("بريد") || c.includes("email")) guessedMapping["email"] = col;
        else if (c.includes("هوية") || c.includes("national")) guessedMapping["nationalId"] = col;
        else if (c.includes("لجنة") || c.includes("committee") || c.includes("comm")) guessedMapping["committee"] = col;
      });
      setColumnMapping(guessedMapping);
      setImportStep(2);
    };
    reader.readAsBinaryString(file);
  };

  const executeImport = async () => {
    if (selectedImportRows.length === 0) {
      setImportError("يرجى تحديد عضو واحد على الأقل للاستيراد");
      return;
    }
    
    // Check if committee is mapped, otherwise use the dropdown
    const mappedCommitteeCol = columnMapping["committee"];
    if (!mappedCommitteeCol && (!importCommitteeId || importCommitteeId === 0 || importCommitteeId === "")) {
      setImportError("يرجى اختيار اللجنة لإضافة الأعضاء إليها أو تعيين عامود للجنة من الملف");
      return;
    }

    let defaultComm = allCommittees.find(c => String(c.id) === String(importCommitteeId));
    
    setIsImporting(true);
    let successCount = 0;
    try {
      for (const rowIndex of selectedImportRows) {
        const rowData = importData[rowIndex];
        const getColValue = (field: string) => {
          const colName = columnMapping[field];
          if (!colName) return "";
          const colIdx = importColumns.indexOf(colName);
          if (colIdx === -1) return "";
          return String(rowData[colIdx] || "");
        };

        const newMember: Omit<Member, "id"> = {
          name: getColValue("name"),
          phone: getColValue("phone"),
          email: getColValue("email"),
          nationalId: getColValue("nationalId"),
          role: "عضو", // default
          title: "الأستاذ",
          customTitle: "",
          committeeId: defaultComm?.id || 0,
          committeeName: defaultComm?.name || "",
          joiningMechanism: "مرشح",
          govAgency: "",
          entity: "غرفة مكة المكرمة",
          active: true,
          joinedDate: new Date().toISOString().split('T')[0],
          note: "مستورد من ملف",
          personalPhoto: "",
          cv: "",
          commercialRegister: "",
          membershipCertificate: "",
          authorization: ""
        };

        const rowCommName = getColValue("committee");
        if (rowCommName) {
           const rowComm = allCommittees.find(c => c.name.includes(rowCommName) || rowCommName.includes(c.name));
           if (rowComm && canUserEditCommittee(rowComm.name)) {
             newMember.committeeId = rowComm.id;
             newMember.committeeName = rowComm.name;
           }
        }
        
        // Final check on committee permission
        if (newMember.committeeId && newMember.committeeName && canUserEditCommittee(newMember.committeeName)) {
           if (newMember.name) {
             await addFirebaseMember(newMember);
             successCount++;
           }
        } else {
           console.warn("Skipping member due to lack of committee permission or unspecified committee", newMember.name);
        }
      }
      setIsImportOpen(false);
      setImportStep(1);
      setImportFile(null);
      setImportData([]);
      setSelectedImportRows([]);
      setImportError("");
      alert(\`تم استيراد \${successCount} عضو بنجاح!\`);
    } catch (error) {
      setImportError("حدث خطأ أثناء الاستيراد");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const closeImportModal = () => {
    setIsImportOpen(false);
    setImportStep(1);
    setImportFile(null);
    setImportData([]);
    setSelectedImportRows([]);
    setImportError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenAdd = () => {
`;

content = content.replace(/  const handleOpenAdd = \(\) => {/g, handlers);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
console.log("Patched handlers");
