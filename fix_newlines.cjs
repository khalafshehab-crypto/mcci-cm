const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

code = code.replace(/text\.split\('[\r\n]+'\)/g, "text.split('\\n')");

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Fixed broken newlines");
