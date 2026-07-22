const fs = require('fs');

const files = ['src/pages/CommitteesLibrary.tsx', 'src/pages/Library.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/const cleanTitle = t\.title\.replace\(/g, 'const cleanTitle = (t.title || "").replace(');
  content = content.replace(/const cleanDesc = t\.description\.replace\(/g, 'const cleanDesc = (t.description || "").replace(');
  content = content.replace(/const cleanCreator = t\.creator\.replace\(/g, 'const cleanCreator = (t.creator || "").replace(');

  fs.writeFileSync(file, content);
  console.log('Fixed replaces in', file);
}
