const fs = require('fs');
const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/existing\.title\.trim\(\) === itemTitle/g, "(existing.title || '').trim() === itemTitle");
  fs.writeFileSync(file, content);
  console.log('Patched ' + file);
}
