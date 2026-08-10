const fs = require('fs');

const files = [
  'src/pages/CommitteesRecommendations.tsx',
  'src/pages/Recommendations.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace all filter-popover keys inside newType === "مفردة" condition
  content = content.replace(
    /({newType === "مفردة" && \(\s*)<div key="filter-popover-\d+-\d+">/g,
    '$1<div key="filter-popover-fixed" className="contents">'
  );

  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
});
