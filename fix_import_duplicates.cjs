const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// 1. Add checkDuplicateRow function before return
const checkDuplicateRowCode = `
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
  };
`;

code = code.replace(/return \(\s*<div/g, checkDuplicateRowCode + '\n  return (\n    <div');

// 2. Modify "التالي (معاينة البيانات)"
const targetNextButton = `                    onClick={() => {
                      setImportStep(3);
                      setSelectedImportRows(importData.map((_, i) => i));
                    }}`;
const replaceNextButton = `                    onClick={() => {
                      setImportStep(3);
                      setSelectedImportRows(importData.map((row, i) => checkDuplicateRow(row) ? -1 : i).filter(i => i !== -1));
                    }}`;
code = code.replace(targetNextButton, replaceNextButton);

// 3. Modify "تحديد الكل"
const targetSelectAll = `onClick={() => {
                          if (selectedImportRows.length === importData.length) setSelectedImportRows([]);
                          else setSelectedImportRows(importData.map((_, i) => i));
                        }}`;
const replaceSelectAll = `onClick={() => {
                          const validRows = importData.map((row, i) => checkDuplicateRow(row) ? -1 : i).filter(i => i !== -1);
                          if (selectedImportRows.length === validRows.length) setSelectedImportRows([]);
                          else setSelectedImportRows(validRows);
                        }}`;
code = code.replace(targetSelectAll, replaceSelectAll);

// 4. Modify Step 3 Table Row
const targetRow = `{importData.map((row, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedImportRows.includes(idx)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedImportRows([...selectedImportRows, idx]);
                                    else setSelectedImportRows(selectedImportRows.filter(r => r !== idx));
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              {importColumns.slice(0, 4).map(col => (
                                <td key={col} className="p-2 text-gray-800 text-xs truncate max-w-[150px]">
                                  {row[importColumns.indexOf(col)]}
                                </td>
                              ))}
                            </tr>
                          ))}`;

const replaceRow = `{importData.map((row, idx) => {
                            const isDup = checkDuplicateRow(row);
                            return (
                            <tr key={idx} className={\`border-b border-gray-100 \${isDup ? 'bg-red-50/50 opacity-60' : 'hover:bg-gray-50/50'}\`}>
                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  disabled={isDup}
                                  checked={!isDup && selectedImportRows.includes(idx)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedImportRows([...selectedImportRows, idx]);
                                    else setSelectedImportRows(selectedImportRows.filter(r => r !== idx));
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                />
                              </td>
                              {importColumns.slice(0, 4).map(col => (
                                <td key={col} className="p-2 text-gray-800 text-xs truncate max-w-[150px] relative">
                                  {row[importColumns.indexOf(col)]}
                                  {isDup && importColumns.indexOf(col) === 0 && (
                                    <span className="absolute -top-1 -right-1 text-[9px] bg-red-100 text-red-600 px-1 rounded font-bold">مكرر</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                          })}`;
code = code.replace(targetRow, replaceRow);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Import duplicates fix applied");
