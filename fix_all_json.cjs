const fs = require('fs');
const files = [
  'src/pages/CommitteesLibrary.tsx',
  'src/pages/Library.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/await response\.json\(\)\.catch\(\(\) => null\)/g, 'await response.text().then(t => t ? JSON.parse(t) : null).catch(() => null)');
    content = content.replace(/await response\.json\(\)/g, '(await response.text().then(t => t ? JSON.parse(t) : {}))');
    fs.writeFileSync(file, content);
    console.log("Fixed " + file);
  }
}
