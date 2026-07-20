const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

code = code.replace(
  /onClick=\{\(\) => \{\s*setIsAddMenuOpen\(false\);\s*setExportModalMode\('import'\);\s*setIsExportOpen\(true\);\s*\}\}/g,
  `onClick={() => {\n                        setIsAddMenuOpen(false);\n                        setIsImportOpen(true);\n                        setImportStep(1);\n                        setImportFile(null);\n                        setImportData([]);\n                        setSelectedImportRows([]);\n                        setImportError("");\n                      }}`
);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Fixed import button");
