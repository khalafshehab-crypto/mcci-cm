const fs = require('fs');

let code = fs.readFileSync('src/lib/mockFirebase.ts', 'utf8');

code = code.replace(
  /export function getLocalCollection\(collectionName: string\): any\[\] \{\s+const dataStr = localStorage\.getItem\(\`mock_db_\$\{collectionName\}\`\);\s+if \(\!dataStr\) \{\s+return getSeedData\(collectionName\);\s+\}\s+try \{\s+return JSON\.parse\(dataStr\);\s+\} catch \(e\) \{\s+return getSeedData\(collectionName\);\s+\}\s+\}/,
  `export function getLocalCollection(collectionName: string): any[] {
  const dataStr = localStorage.getItem(\`mock_db_\${collectionName}\`);
  let data;
  if (!dataStr) {
    data = getSeedData(collectionName);
  } else {
    try {
      data = JSON.parse(dataStr);
    } catch (e) {
      data = getSeedData(collectionName);
    }
  }
  let changed = false;
  const fixedData = data.map(item => {
    if (!item || !item.id) {
      changed = true;
      return { ...item, id: Math.random().toString(36).substring(2, 11) };
    }
    return item;
  });
  if (changed) {
    localStorage.setItem(\`mock_db_\${collectionName}\`, JSON.stringify(fixedData));
  }
  return fixedData;
}`
);

fs.writeFileSync('src/lib/mockFirebase.ts', code);
