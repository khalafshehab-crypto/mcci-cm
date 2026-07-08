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

  // Change type in interfaces if committeeId exists
  content = content.replace(/committeeId:\s*number;/g, 'committeeId: number | string;');
  
  // Replace Number(selectedCommitteeId) with selectedCommitteeId
  content = content.replace(/Number\(selectedCommitteeId\)/g, 'selectedCommitteeId');
  
  // Replace Number(e.target.value) for setSelectedCommitteeId
  content = content.replace(/setSelectedCommitteeId\(Number\(e\.target\.value\)\)/g, 'setSelectedCommitteeId(e.target.value)');
  
  // Replace Number(e.target.value) for setNewCommitteeId
  content = content.replace(/setNewCommitteeId\(Number\(e\.target\.value\)\)/g, 'setNewCommitteeId(e.target.value)');
  
  // Replace Number(e.target.value) for setImportCommitteeId
  content = content.replace(/setImportCommitteeId\(Number\(e\.target\.value\)\)/g, 'setImportCommitteeId(e.target.value)');

  // Fix comparisons where c.id is compared to committeeId or similar
  content = content.replace(/m\.committeeId === comm\.id/g, 'String(m.committeeId) === String(comm.id)');
  content = content.replace(/e\.committeeId === comm\.id/g, 'String(e.committeeId) === String(comm.id)');
  
  // Change selectedCommitteeId type if found
  content = content.replace(/useState<number>\(0\);/g, 'useState<number | string>(0);');
  content = content.replace(/useState<number>\(1\);/g, 'useState<number | string>(1);');
  
  // Change selectedCommitteeId = "" check
  content = content.replace(/!selectedCommitteeId \|\| selectedCommitteeId === 0/g, '!selectedCommitteeId || selectedCommitteeId === 0 || selectedCommitteeId === ""');

  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}
