const fs = require('fs');

const filesToPatch = [
  'src/pages/CommitteesMembers.tsx',
  'src/pages/Members.tsx',
  'src/pages/CommitteesRecommendations.tsx',
  'src/pages/Recommendations.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/Events.tsx',
  'src/pages/CommitteesFormation.tsx',
  'src/pages/Committees.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/committeeId:\s*number;/g, 'committeeId: number | string;');
  content = content.replace(/Number\(selectedCommitteeId\)/g, 'selectedCommitteeId');
  content = content.replace(/setSelectedCommitteeId\(Number\(e\.target\.value\)\)/g, 'setSelectedCommitteeId(e.target.value)');
  content = content.replace(/setNewCommitteeId\(Number\(e\.target\.value\)\)/g, 'setNewCommitteeId(e.target.value)');
  content = content.replace(/setImportCommitteeId\(Number\(e\.target\.value\)\)/g, 'setImportCommitteeId(e.target.value)');
  content = content.replace(/m\.committeeId === comm\.id/g, 'String(m.committeeId) === String(comm.id)');
  content = content.replace(/e\.committeeId === comm\.id/g, 'String(e.committeeId) === String(comm.id)');
  content = content.replace(/useState<number>\(0\);/g, 'useState<number | string>(0);');
  content = content.replace(/useState<number>\(1\);/g, 'useState<number | string>(1);');
  content = content.replace(/!selectedCommitteeId \|\| selectedCommitteeId === 0/g, '!selectedCommitteeId || selectedCommitteeId === 0 || selectedCommitteeId === ""');
  content = content.replace(/c\.id === selectedCommitteeId/g, 'String(c.id) === String(selectedCommitteeId)');
  content = content.replace(/c\.id === Number\(selectedCommitteeId\)/g, 'String(c.id) === String(selectedCommitteeId)');

  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}
