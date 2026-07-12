const fs = require('fs');
const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `    // Get standalone recommendations from events (they have recommendationType)
    let mappedStandalone = events
       .filter(e => !!e.recommendationType)
       .map(e => ({`;
            
  const newText = `    // Get standalone recommendations from events (they have recommendationType)
    let mappedStandalone = events
       .filter(e => !!e.recommendationType)
       .map(e => {
           let resolvedAssignee = e.employees && e.employees.length > 0 ? e.employees[0] : (e.recommendationAssignee || "غير محدد");
           if (resolvedAssignee === "الأخصائي" || resolvedAssignee === "أخصائي اللجنة") {
              const comm = committees.find(c => c.name === e.committeeName || String(c.id) === String(e.committeeId));
              if (comm && comm.specialist) {
                  resolvedAssignee = \`أخصائي اللجنة: \${comm.specialist}\`;
              }
           }
           return {`;

  if (code.includes(target)) {
    code = code.replace(target, newText);
    
    // now replace recommendationAssignee inside map
    code = code.replace(
      `          recommendationAssignee: e.employees && e.employees.length > 0 ? e.employees[0] : "غير محدد",`,
      `          recommendationAssignee: resolvedAssignee,`
    );
    
    // add closing brace for map
    code = code.replace(
      `          isRealEvent: false
       }));`,
      `          isRealEvent: false
       }; });`
    );
    
    fs.writeFileSync(filename, code);
    console.log("Patched resolve_assignee standalone");
  } else {
    console.log("resolve_assignee standalone target not found");
  }
}
