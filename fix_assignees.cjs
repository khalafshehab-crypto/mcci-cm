const fs = require('fs');

['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'].forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');

  // Replace availableAssignees memo block
  const oldMemoRegex = /const availableAssignees = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[allMembers, committees, newCommitteeId\]\);/;
  const newMemo = `const availableAssignees = React.useMemo(() => {
    const comm = committees.find(c => c.id === newCommitteeId);
    const specialist = comm?.specialist ? \`أخصائي اللجنة - \${comm.specialist}\` : "";
    const members = allMembers.filter(m => m.committeeId === newCommitteeId).map(m => \`\${m.role} - \${m.title} \${m.name}\`);
    return Array.from(new Set([specialist, ...members].filter(Boolean)));
  }, [allMembers, committees, newCommitteeId]);`;

  content = content.replace(oldMemoRegex, newMemo);

  fs.writeFileSync(filepath, content, 'utf8');
});
console.log('Fixed assignees in Recommendations pages');
