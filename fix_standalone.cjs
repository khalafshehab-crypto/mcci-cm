const fs = require('fs');
const filepath = 'src/pages/CommitteesRecommendations.tsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(
  'const commRecsCount = dbRecsCount + standaloneRecsCount;',
  'const standaloneRecsCount = events.filter((e) => String(e.committeeId) === String(comm.id) && !!e.recommendationType).length;\n                  const commRecsCount = dbRecsCount + standaloneRecsCount;'
);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Fixed standaloneRecsCount');
