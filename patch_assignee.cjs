const fs = require('fs');

const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `const assigneeText = evt.assignedTo || evt.recommendationAssignee || (evt.employees && evt.employees.length > 0 ? evt.employees[0] : "غير محدد");`;
            
  const newText = `let assigneeText = evt.assignedTo || evt.recommendationAssignee || (evt.employees && evt.employees.length > 0 ? evt.employees[0] : "غير محدد");
if (assigneeText === "الأخصائي" || assigneeText === "أخصائي اللجنة") {
    const committeeIdMatch = evt.committeeId || (events.find(e => String(e.id) === String(evt.recommendationEventId))?.committeeId);
    const comm = committees.find(c => c.name === evt.committeeName || (committeeIdMatch && String(c.id) === String(committeeIdMatch)));
    if (comm && comm.specialist) {
        assigneeText = \`أخصائي اللجنة: \${comm.specialist}\`;
    }
}`;

  if (code.includes(target)) {
    code = code.replace(target, newText);
    fs.writeFileSync(filename, code);
    console.log("Patched assigneeText");
  } else {
    console.log("assigneeText target not found");
  }
}
