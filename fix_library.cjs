const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');

  const target = `    if (
      searchQuery &&
      !t.title.includes(searchQuery) &&
      !t.description.includes(searchQuery) &&
      !t.creator.includes(searchQuery)
    )`;
  const replace = `    if (
      searchQuery &&
      !(t.title || "").includes(searchQuery) &&
      !(t.description || "").includes(searchQuery) &&
      !(t.creator || "").includes(searchQuery) &&
      !(t.type || "").includes(searchQuery) &&
      !(t.category || "").includes(searchQuery) &&
      !(t.committeeName || "").includes(searchQuery)
    )`;

  if (code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync(filepath, code);
    console.log("Patched " + filepath);
  } else {
    console.log("Target not found in " + filepath);
  }
}

patchFile('src/pages/CommitteesLibrary.tsx');
patchFile('src/pages/Library.tsx');
