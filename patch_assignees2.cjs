const fs = require('fs');

const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `  const availableAssignees = React.useMemo(() => {
    const comm = committees.find(c => c.id === newCommitteeId);
    const specialist = comm?.specialist ? \`\${comm.specialist} (أخصائي اللجنة)\` : "أخصائي اللجنة";
    const members = allMembers.filter(m => m.committeeId === newCommitteeId).map(m => \`\${m.title} \${m.name} (\${m.role})\`);
    return Array.from(new Set([specialist, ...members].filter(Boolean)));
  }, [allMembers, committees, newCommitteeId]);`;

  const newFunction = `  const availableAssignees = React.useMemo(() => {
    const comm = committees.find(c => c.id === newCommitteeId);
    const specialistValue = comm?.specialist ? \`\${comm.specialist} (أخصائي اللجنة)\` : "أخصائي اللجنة";
    const options = [];
    options.push({ value: specialistValue, label: specialistValue });
    allMembers.filter(m => m.committeeId === newCommitteeId).forEach(m => {
      options.push({ value: \`\${m.role} - \${m.title} \${m.name}\`, label: \`\${m.title} \${m.name} (\${m.role})\` });
    });
    return options;
  }, [allMembers, committees, newCommitteeId]);`;
  
  if (code.includes(target)) {
    code = code.replace(target, newFunction);
    
    // Also we need to replace the select rendering
    const selectTarget = `<select
                              value={newRecAssignee}
                              onChange={(e) => setNewRecAssignee(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="">-- اختر المكلف --</option>
                              {availableAssignees.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>`;
                            
    const newSelect = `<select
                              value={newRecAssignee}
                              onChange={(e) => setNewRecAssignee(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="">-- اختر المكلف --</option>
                              {availableAssignees.map((opt: any) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>`;
    
    code = code.replace(selectTarget, newSelect);
    
    fs.writeFileSync(filename, code);
    console.log("Patched CommitteesRecommendations.tsx (availableAssignees and select)");
  } else {
    console.log("availableAssignees block not found in CommitteesRecommendations.tsx");
  }
}
