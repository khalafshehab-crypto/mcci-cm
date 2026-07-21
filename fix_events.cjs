const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');

  const target = `    return (
      (e.title || "").toLowerCase().includes(term) ||
      (e.committeeName || "").toLowerCase().includes(term)
    );`;
  const replace = `    return (
      (e.title || "").toLowerCase().includes(term) ||
      (e.committeeName || "").toLowerCase().includes(term) ||
      (e.type || "").toLowerCase().includes(term) ||
      (e.location || "").toLowerCase().includes(term) ||
      (e.status || "").toLowerCase().includes(term) ||
      (e.date || "").toLowerCase().includes(term)
    );`;

  if (code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync(filepath, code);
    console.log("Patched " + filepath);
  } else {
    console.log("Target not found in " + filepath);
  }
}

patchFile('src/pages/CommitteesEvents.tsx');
patchFile('src/pages/Events.tsx');
