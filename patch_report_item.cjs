const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf-8');

code = code.replace(
  'selectedItemsCount?: number;',
  'selectedItemsCount?: number;\n  extractedItems?: any[];'
);

fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
console.log("Patched ReportItem interface");
