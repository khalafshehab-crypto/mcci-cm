const fs = require('fs');

const files = ['src/pages/CommitteesLibrary.tsx', 'src/pages/Library.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace back to original
  content = content.replace(/key=\{t\.id \|\| Math\.random\(\)\.toString\(\)\}/g, 'key={t.id}');
  content = content.replace(/key=\{c\.id \|\| Math\.random\(\)\.toString\(\)\}/g, 'key={c.id}');
  content = content.replace(/key=\{emp\.id \|\| Math\.random\(\)\.toString\(\)\}/g, 'key={emp.id}');

  fs.writeFileSync(file, content);
  console.log('Cleaned keys in', file);
}
