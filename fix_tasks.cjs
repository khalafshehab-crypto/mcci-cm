const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');

  const target = `    const matchesSearch = !term ||
      (t.title || "").toLowerCase().includes(term) ||
      (t.description || "").toLowerCase().includes(term);`;
  const replace = `    const matchesSearch = !term ||
      (t.title || "").toLowerCase().includes(term) ||
      (t.description || "").toLowerCase().includes(term) ||
      (t.assignedTo || "").toLowerCase().includes(term) ||
      (t.assignedBy || "").toLowerCase().includes(term) ||
      (t.status || "").toLowerCase().includes(term) ||
      (t.priority || "").toLowerCase().includes(term) ||
      (t.dueDate || "").toLowerCase().includes(term);`;

  if (code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync(filepath, code);
    console.log("Patched " + filepath);
  } else {
    console.log("Target not found in " + filepath);
  }
}

patchFile('src/pages/CommitteesTasks.tsx');
patchFile('src/pages/Tasks.tsx');
