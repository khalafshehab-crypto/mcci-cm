const fs = require('fs');

const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `        if (!existing.recommendationAssignee || existing.recommendationAssignee === "غير محدد") {
           existing.recommendationAssignee = ar.assignedTo;
        }`;
            
  const newText = `        if (!existing.recommendationAssignee || existing.recommendationAssignee === "غير محدد") {
           existing.recommendationAssignee = ar.assignedTo;
        }
        if (!existing.time) existing.time = ar.time;
        if (!existing.location) existing.location = ar.location;
        if (!existing.recommendationEventId) existing.recommendationEventId = ar.recommendationEventId;`;

  if (code.includes(target)) {
    code = code.replace(target, newText);
    fs.writeFileSync(filename, code);
    console.log("Patched existing recs");
  } else {
    console.log("existing recs target not found");
  }
}
