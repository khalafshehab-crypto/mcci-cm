const fs = require('fs');

const filesToPatch = [
  'src/pages/Events.tsx',
  'src/pages/CommitteesEvents.tsx',
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace const val = Number(e.target.value); setNewCommitteeId(val); 
  // with const val = e.target.value; setNewCommitteeId(val);
  content = content.replace(/const val = Number\(e\.target\.value\);/g, 'const val = e.target.value;');
  
  // Replace c.id === val with String(c.id) === String(val)
  content = content.replace(/c\.id === val/g, 'String(c.id) === String(val)');

  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}
