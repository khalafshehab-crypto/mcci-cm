const fs = require('fs');
const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `    let agendaRecs: any[] = [];
    events.forEach(evt => {
      if (evt.agenda && Array.isArray(evt.agenda)) {
        evt.agenda.forEach((item: any, index: number) => {`;
            
  const newText = `    let agendaRecs: any[] = [];
    events.forEach(evt => {
      if (evt.agenda && Array.isArray(evt.agenda)) {
        evt.agenda.forEach((item: any, index: number) => {
          let resolvedAssignee = item.assignee || "غير محدد";
          if (resolvedAssignee === "الأخصائي" || resolvedAssignee === "أخصائي اللجنة") {
              const comm = committees.find(c => c.name === evt.committeeName || String(c.id) === String(evt.committeeId));
              if (comm && comm.specialist) {
                  resolvedAssignee = \`أخصائي اللجنة: \${comm.specialist}\`;
              }
          }`;

  if (code.includes(target)) {
    code = code.replace(target, newText);
    
    // now replace assignedTo in agendaRecs.push
    code = code.replace(`              assignedTo: item.assignee || "غير محدد",`, `              assignedTo: resolvedAssignee,`);
    
    fs.writeFileSync(filename, code);
    console.log("Patched resolve_assignee agenda");
  } else {
    console.log("resolve_assignee agenda target not found");
  }
}
