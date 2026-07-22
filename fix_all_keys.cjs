const fs = require('fs');

const files = ['src/pages/CommitteesLibrary.tsx', 'src/pages/Library.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Change key={t.id} to key={t.id + '-' + Math.random()} 
  content = content.replace(/key=\{t\.id\}/g, 'key={`${t.id}-${Math.random()}`}');
  
  // Also fix key={c.id} and key={emp.id}
  content = content.replace(/key=\{c\.id\}/g, 'key={`${c.id}-${Math.random()}`}');
  content = content.replace(/key=\{emp\.id\}/g, 'key={`${emp.id}-${Math.random()}`}');

  fs.writeFileSync(file, content);
  console.log('Fixed keys with random in', file);
}
