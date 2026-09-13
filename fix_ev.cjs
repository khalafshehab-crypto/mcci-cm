const fs = require('fs');
const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/const updatedEvent = \{\s*\.\.\.ev,/g, 'const updatedEvent = {\n        ...editingEvent,');
  fs.writeFileSync(file, code);
}
console.log("Fixed ev reference");
