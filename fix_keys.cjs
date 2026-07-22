const fs = require('fs');

function fixKeys(file, mapVar, idProp) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    new RegExp(`\\{\\s*${mapVar}\\.map\\(\\s*\\([^)]+\\)\\s*=>\\s*\\(\\s*<motion\\.div`, 'g'),
    `{${mapVar}.map((comm) => (\n              <motion.div key={comm.${idProp}}`
  );
  fs.writeFileSync(file, code);
}

fixKeys('src/pages/Committees.tsx', 'filteredCommittees', 'id');
fixKeys('src/pages/CommitteesFormation.tsx', 'filteredCommittees', 'id');
