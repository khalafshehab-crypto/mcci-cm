const fs = require('fs');

const files = ['src/pages/Recommendations.tsx', 'src/pages/CommitteesRecommendations.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/evt\.preparationsText\.substring/g, '(evt.preparationsText || "").substring');
  fs.writeFileSync(file, content);
  console.log('Fixed prep text in', file);
}
