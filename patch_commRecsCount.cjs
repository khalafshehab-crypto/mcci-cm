const fs = require('fs');

const filepath = 'src/pages/CommitteesRecommendations.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Replace the commRecsCount calculation
content = content.replace(
  /const agendaRecsCount = commSessions\.reduce\([\s\S]*?const commRecsCount = dbRecsCount \+ agendaRecsCount \+ standaloneRecsCount;/m,
  `const commRecsCount = dbRecsCount + standaloneRecsCount;`
);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Patched commRecsCount');
