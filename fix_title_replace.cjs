const fs = require('fs');

const files = ['src/pages/CommitteesLibrary.tsx', 'src/pages/Library.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/`\$\{t\.title\.replace\(\/\\s\+\/g, "_"\)\}/g, '`${(t.title || "").replace(/\\s+/g, "_")}');

  fs.writeFileSync(file, content);
  console.log('Fixed title replace in', file);
}
