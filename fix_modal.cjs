const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const importModalRegex = /      \{\/\* Import Modal \*\/\}[\s\S]*?<\/AnimatePresence>\n\n      <AnimatePresence>/g;
content = content.replace(importModalRegex, '      <AnimatePresence>');
fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
console.log("Reverted modal duplicates");
