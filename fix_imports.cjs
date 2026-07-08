const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

if (!content.includes('UserPlus')) {
  content = content.replace('Users,', 'Users, UserPlus,');
} else {
  // It is in the file but maybe not in import?
  const importLines = content.match(/import \{[^}]+\}\s+from\s+"lucide-react";/)[0];
  if (!importLines.includes('UserPlus')) {
    const newImportLines = importLines.replace('Users,', 'Users, UserPlus,');
    content = content.replace(importLines, newImportLines);
  }
}

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
fs.writeFileSync('src/pages/Members.tsx', content);
console.log("Fixed UserPlus import");
