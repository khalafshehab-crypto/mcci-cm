const fs = require('fs');

const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `          recommendationAssignee: e.employees && e.employees.length > 0 ? e.employees[0] : "غير محدد",`;
            
  const newText = `          recommendationAssignee: e.employees && e.employees.length > 0 ? e.employees[0] : "غير محدد",
          recommendationEventId: e.id,
          time: e.time || "",
          location: e.location || "",`;

  if (code.includes(target)) {
    code = code.replace(target, newText);
    fs.writeFileSync(filename, code);
    console.log("Patched standalone");
  } else {
    console.log("standalone target not found");
  }
}
