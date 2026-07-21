const fs = require('fs');

function fixFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');
  
  // Find {agenda.map((item, idx) => ( ... <div key={item.id || index}
  code = code.replace(/\{agenda\.map\(\(item, idx\) => \(\s*<div key=\{item\.id \|\| index\}/g, '{agenda.map((item, idx) => (\n                                                  <div key={item.id || idx}');
  
  fs.writeFileSync(filepath, code);
  console.log("Fixed keys again in " + filepath);
}

fixFile('src/pages/CommitteesEvents.tsx');
fixFile('src/pages/Events.tsx');
