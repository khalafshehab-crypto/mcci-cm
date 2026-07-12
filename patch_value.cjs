const fs = require('fs');

function patchFile(filename) {
  if (!fs.existsSync(filename)) return;
  let code = fs.readFileSync(filename, 'utf-8');
  
  const oldCode = `<select
                                                          value={item.assignee || ""}
                                                          onChange={(e) => handleUpdateAgendaMinutes(item.id, { assignee: e.target.value })}`;
  
  const newCode = `<select
                                                          value={(item.assignee === "الأخصائي" && evt.employees?.[0]) ? \`\${evt.employees[0]} (أخصائي اللجنة)\` : (item.assignee === "الأخصائي" ? "أخصائي اللجنة" : (item.assignee || ""))}
                                                          onChange={(e) => handleUpdateAgendaMinutes(item.id, { assignee: e.target.value })}`;
                                                          
  if (code.includes(oldCode)) {
    code = code.replace(oldCode, newCode);
    fs.writeFileSync(filename, code);
    console.log("Patched " + filename);
  }
}

patchFile('src/pages/CommitteesEvents.tsx');
patchFile('src/pages/Events.tsx');
