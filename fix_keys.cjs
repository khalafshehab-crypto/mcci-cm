const fs = require('fs');

function fixFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');
  
  code = code.replace(/key=\{item\.id\}/g, 'key={item.id || index}');
  code = code.replace(/key=\{rec\.id\}/g, 'key={rec.id || index}');
  
  fs.writeFileSync(filepath, code);
  console.log("Fixed keys in " + filepath);
}

fixFile('src/pages/CommitteesEvents.tsx');
fixFile('src/pages/Events.tsx');
