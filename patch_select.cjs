const fs = require('fs');

const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const selectTarget = `                              {availableAssignees.map(emp => <option key={emp} value={emp}>{emp}</option>)}`;
                            
  const newSelect = `                              {availableAssignees.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}`;
  
  if (code.includes(selectTarget)) {
    code = code.replace(selectTarget, newSelect);
    fs.writeFileSync(filename, code);
    console.log("Patched CommitteesRecommendations.tsx (select options)");
  } else {
    console.log("selectTarget not found");
  }
}
