const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const handlers = `
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [isFetchingSheet, setIsFetchingSheet] = useState(false);

  const handleFetchGoogleSheet = async () => {
    if (!googleSheetUrl) {
      setImportError("يرجى إدخال رابط ملف Google Drive");
      return;
    }
    
    // Extract ID
    const match = googleSheetUrl.match(/\\/d\\/([a-zA-Z0-9-_]+)/);
    const sheetId = match ? match[1] : null;
    if (!sheetId) {
      setImportError("رابط Google Drive غير صالح. يجب أن يحتوي على معرف الملف (ID).");
      return;
    }
    
    setIsFetchingSheet(true);
    setImportError("");
    try {
      const exportUrl = \`https://docs.google.com/spreadsheets/d/\${sheetId}/export?format=xlsx\`;
      const res = await fetch("/api/fetch-public-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: exportUrl })
      });
      
      if (!res.ok) {
        throw new Error("تأكد من أن الملف 'متاح لأي شخص لديه الرابط' (Public)");
      }
      
      const buffer = await res.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (data.length < 2) {
        setImportError("الملف فارغ أو لا يحتوي على صفوف بيانات.");
        setIsFetchingSheet(false);
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
    } catch (err: any) {
      setImportError(err.message || "حدث خطأ أثناء جلب الملف من Google Drive");
    } finally {
      setIsFetchingSheet(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
`;

content = content.replace(/  const handleFileChange = \(e: ChangeEvent<HTMLInputElement>\) => \{/, handlers);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
console.log("Patched handlers gsheets");
