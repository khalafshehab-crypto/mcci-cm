const fs = require('fs');
const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `      mappedDbMap.set(String(rec.id), {
        isAgendaSource: String(rec.id).startsWith("custom-rec-"),
        ...rec,`;
            
  const newText = `      let resolvedAssignee = rec.recommendationAssignee || rec.assignedTo || "غير محدد";
      if (resolvedAssignee === "الأخصائي" || resolvedAssignee === "أخصائي اللجنة") {
          const comm = committees.find(c => c.name === rec.committeeName || String(c.id) === String(rec.committeeId));
          if (comm && comm.specialist) {
              resolvedAssignee = \`أخصائي اللجنة: \${comm.specialist}\`;
          }
      }
      mappedDbMap.set(String(rec.id), {
        isAgendaSource: String(rec.id).startsWith("custom-rec-"),
        ...rec,
        recommendationAssignee: resolvedAssignee,
        assignedTo: resolvedAssignee,`;

  if (code.includes(target)) {
    code = code.replace(target, newText);
    fs.writeFileSync(filename, code);
    console.log("Patched resolve_assignee db");
  } else {
    console.log("resolve_assignee db target not found");
  }
}
