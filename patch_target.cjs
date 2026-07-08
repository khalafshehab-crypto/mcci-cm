const fs = require('fs');
const filesToPatch = [
  'src/pages/Events.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/CommitteesRecommendations.tsx',
  'src/pages/Recommendations.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/const targetId = Number\(\(location\.state as any\)\.selectedEventId\);/g, 'const targetId = String((location.state as any).selectedEventId);');
  content = content.replace(/Number\(e\.id\) === targetId/g, 'String(e.id) === targetId');
  content = content.replace(/setExpandedEventId\(targetId\);/g, 'setExpandedEventId(targetId as any);');
  
  fs.writeFileSync(file, content);
  console.log(`Patched targetId in ${file}`);
}
