const fs = require('fs');

const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/onClick=\{\(\) => \{\}\}/g, 'onClick={() => handleOpenEdit(evt)}');
  fs.writeFileSync(file, code);
}
console.log("Updated all files.");
