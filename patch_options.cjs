const fs = require('fs');

function patchFile(filename) {
  if (!fs.existsSync(filename)) return;
  let code = fs.readFileSync(filename, 'utf-8');
  
  const oldCode = `<option value="الأخصائي">أخصائي اللجنة</option>`;
  const newCode = `<option value={evt.employees?.[0] ? \`\${evt.employees[0]} (أخصائي اللجنة)\` : "أخصائي اللجنة"}>
                                                            {evt.employees?.[0] ? \`\${evt.employees[0]} (أخصائي اللجنة)\` : "أخصائي اللجنة"}
                                                          </option>`;
                                                          
  if (code.includes(oldCode)) {
    code = code.replace(oldCode, newCode);
    fs.writeFileSync(filename, code);
    console.log("Patched " + filename);
  }
}

patchFile('src/pages/CommitteesEvents.tsx');
patchFile('src/pages/Events.tsx');
