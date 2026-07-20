const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// Fix missing imports
if (!code.includes('Download,')) {
  code = code.replace(/import \{([\s\S]*?)X,/m, 'import {$1X,\n  Download,\n  Upload,\n');
}

// Fix committees to dbCommittees in confirmCSVImport
code = code.replace(/const comm = committees\.find/g, 'const comm = dbCommittees.find');

// Fix synchronizedMembers to members in handleExportToGoogleSheets
code = code.replace(/synchronizedMembers\.filter/g, 'members.filter');
code = code.replace(/: synchronizedMembers;/g, ': members;');

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
