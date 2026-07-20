const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const regexImportOpen = /\{\/\* 📥 IMPORT MODAL \*\/\}\s*<AnimatePresence>\s*\{isImportOpen && \([\s\S]*?\}\s*<\/AnimatePresence>/;

if (code.match(regexImportOpen)) {
  code = code.replace(regexImportOpen, '');
  console.log("Removed old Google Sheets import modal");
} else {
  console.log("Old import modal not found");
}

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
