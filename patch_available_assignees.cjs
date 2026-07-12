const fs = require('fs');
const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `  const availableAssignees = React.useMemo(() => {
    const comm = committees.find(c => c.id === newCommitteeId);
    const specialistValue = comm?.specialist ? \`\${comm.specialist} (أخصائي اللجنة)\` : "أخصائي اللجنة";
    const options = [];
    options.push({ value: specialistValue, label: specialistValue });
    allMembers.filter(m => m.committeeId === newCommitteeId).forEach(m => {
      options.push({ value: \`\${m.role} - \${m.title} \${m.name}\`, label: \`\${m.title} \${m.name} (\${m.role})\` });
    });
    return options;
  }, [allMembers, committees, newCommitteeId]);`;
            
  const newText = `  const availableAssignees = React.useMemo(() => {
    const comm = committees.find(c => String(c.id) === String(newCommitteeId));
    const specialistValue = comm?.specialist ? \`\${comm.specialist} (أخصائي اللجنة)\` : "أخصائي اللجنة";
    const options = [];
    options.push({ value: specialistValue, label: specialistValue });
    allMembers.filter(m => String(m.committeeId) === String(newCommitteeId)).forEach(m => {
      options.push({ value: \`\${m.role} - \${m.title} \${m.name}\`, label: \`\${m.title} \${m.name} (\${m.role})\` });
    });
    
    if (newRecAssignee && !options.find(o => o.value === newRecAssignee)) {
      options.push({ value: newRecAssignee, label: newRecAssignee });
    }
    
    return options;
  }, [allMembers, committees, newCommitteeId, newRecAssignee]);`;

  if (code.includes(target)) {
    code = code.replace(target, newText);
    fs.writeFileSync(filename, code);
    console.log("Patched available assignees correctly");
  } else {
    console.log("Target not found");
  }
}
