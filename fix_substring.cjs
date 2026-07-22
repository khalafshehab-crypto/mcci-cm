const fs = require('fs');

const files = ['src/pages/CommitteesLibrary.tsx', 'src/pages/Library.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/t\.creator\.substring/g, '(t.creator || "  ").substring');
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}
