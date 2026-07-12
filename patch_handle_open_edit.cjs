const fs = require('fs');
const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `    // Try to get assignee properly
    let assigned = evt.recommendationAssignee || evt.assignedTo || (evt.employees && evt.employees[0]) || "";
    if (assigned === "غير محدد") assigned = "";
    setNewRecAssignee(assigned);`;
            
  if (code.includes(target)) {
    const newText = `    // Try to get assignee properly
    let assigned = evt.recommendationAssignee || evt.assignedTo || (evt.employees && evt.employees[0]) || "";
    if (assigned === "غير محدد") assigned = "";
    
    const commForAssignee = committees.find(c => String(c.id) === String(derivedCommitteeId));
    if (commForAssignee && commForAssignee.specialist) {
        if (assigned === "الأخصائي" || assigned === "أخصائي اللجنة" || (assigned.includes(commForAssignee.specialist) && assigned.includes("أخصائي"))) {
            assigned = \`\${commForAssignee.specialist} (أخصائي اللجنة)\`;
        }
    }
    setNewRecAssignee(assigned);`;
    code = code.replace(target, newText);
    fs.writeFileSync(filename, code);
    console.log("Patched handleOpenEdit assignee");
  } else {
    console.log("handleOpenEdit target not found");
  }
}
