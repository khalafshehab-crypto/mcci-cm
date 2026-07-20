const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// 1. Point the "استيراد" button to use setIsImportOpen(true) instead of exportModalMode
code = code.replace(
  /onClick=\{\(\) => \{\s*setIsAddMenuOpen\(false\);\s*setExportModalMode\('import'\);\s*setIsExportOpen\(true\);\s*\}\}/g,
  `onClick={() => {\n                        setIsAddMenuOpen(false);\n                        setIsImportOpen(true);\n                        setImportStep(1);\n                        setImportFile(null);\n                        setImportData([]);\n                        setSelectedImportRows([]);\n                      }}`
);

// 2. Remove the 'import' part from EXPORT modal (we don't need exportModalMode anymore, but I'll leave the state just in case, or I'll just change the UI to not use it).
// Actually, it's easier to just overwrite the EXPORT/IMPORT MODAL part entirely.
