const fs = require('fs');
const filesToPatch = [
  'src/pages/CommitteesMembers.tsx',
  'src/pages/Members.tsx',
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // We already replaced Number(selectedCommitteeId) with selectedCommitteeId in previous patch
  // so the line now looks like: c.id === selectedCommitteeId
  // We should change it to String(c.id) === String(selectedCommitteeId)
  content = content.replace(/c\.id === selectedCommitteeId/g, 'String(c.id) === String(selectedCommitteeId)');

  fs.writeFileSync(file, content);
  console.log(`Patched ${file} again`);
}
