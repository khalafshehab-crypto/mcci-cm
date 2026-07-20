const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

code = code.replace(/c => c\.name\.includes\(rowCommName\) \|\| rowCommName\.includes\(c\.name\)/g, 
  'c => (c.name || "").includes(rowCommName || "") || (rowCommName || "").includes(c.name || "")');

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Patched CommitteesMembers includes");
