const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

code = code.replace(/csvRows\]\.join\("[\r\n]+"\)/g, 'csvRows].join("\\n")');

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Fixed second broken newline");
