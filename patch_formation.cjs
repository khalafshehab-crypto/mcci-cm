const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Same for comm.name
  const oldStyleC = `style={{ display: canUserEditCommittee(comm.name) ? 'flex' : 'none' }}`;
  if (content.includes(oldStyleC)) {
      content = content.replaceAll(oldStyleC, '');
      console.log("Patched comm style in " + filepath);
  }

  fs.writeFileSync(filepath, content);
  console.log("Saved " + filepath);
}

patchFile('src/pages/CommitteesFormation.tsx');
patchFile('src/pages/Committees.tsx');
