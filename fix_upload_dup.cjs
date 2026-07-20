const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const lines = code.split('\n');
code = lines.filter((line, index) => !(line.trim() === 'Upload,' && index === 34)).join('\n');

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
