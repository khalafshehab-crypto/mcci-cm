const fs = require('fs');

function fixVariables(filepath) {
  if (!fs.existsSync(filepath)) return;
  let code = fs.readFileSync(filepath, 'utf8');
  code = code.replace(/setSlVariables\(\[\]\);\s*/g, '');
  fs.writeFileSync(filepath, code);
  console.log("Fixed " + filepath);
}

fixVariables('src/pages/CommitteesLibrary.tsx');
fixVariables('src/pages/Library.tsx');

let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');
code = code.replace(/committees\.find/g, 'dbCommittees.find');
fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Fixed members");
