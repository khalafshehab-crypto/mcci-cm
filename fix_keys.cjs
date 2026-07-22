const fs = require('fs');

const files = ['src/pages/CommitteesLibrary.tsx', 'src/pages/Library.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace key={t.id} with key={t.id || Math.random().toString()}
  content = content.replace(/key=\{t\.id\}/g, 'key={t.id || Math.random().toString()}');
  
  // Also fix key={c.id} and key={emp.id}
  content = content.replace(/key=\{c\.id\}/g, 'key={c.id || Math.random().toString()}');
  content = content.replace(/key=\{emp\.id\}/g, 'key={emp.id || Math.random().toString()}');

  fs.writeFileSync(file, content);
  console.log('Fixed keys in', file);
}
