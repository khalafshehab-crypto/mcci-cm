const fs = require('fs');
const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `        status: rec.status || "جديدة",
        recommendationAssignee: rec.assignedTo || "غير محدد",
        recommendationType: true,`;
            
  const newText = `        status: rec.status || "جديدة",
        recommendationType: true,`;

  if (code.includes(target)) {
    code = code.replace(target, newText);
    fs.writeFileSync(filename, code);
    console.log("Patched resolve_assignee db2");
  } else {
    console.log("resolve_assignee db2 target not found");
  }
}
