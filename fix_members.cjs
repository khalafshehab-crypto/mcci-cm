const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const target = `  const displayValue = (value && typeof value === "object" && "name" in value) ? (value as any).name : value;
  
  const checkDuplicateRow = (row: any) => {
    const getColValue = (field: string) => {
      const colName = columnMapping[field];
      if (!colName) return "";
      const colIdx = importColumns.indexOf(colName);
      if (colIdx === -1) return "";
      return String(row[colIdx] || "");
    };

    const nameVal = getColValue("name").trim();
    const phoneVal = getColValue("phone").trim();
    const emailVal = getColValue("email").trim();
    const nationalIdVal = getColValue("nationalId").trim();

    return members.some(m =>
      (nameVal && m.name.trim() === nameVal) ||
      (emailVal && m.email.trim() === emailVal) ||
      (phoneVal && m.phone.trim() === phoneVal) ||
      (nationalIdVal && m.nationalId.trim() === nationalIdVal)
    );
  };`;

code = code.replace(target, `  const displayValue = (value && typeof value === "object" && "name" in value) ? (value as any).name : value;`);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
