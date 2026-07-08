const fs = require('fs');

['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'].forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');

  // Replace availableAssignees memo block
  const oldMemoRegex = /const availableAssignees = React\.useMemo\(\(\) => \{\s*const comm = committees\.find\(c => c\.id === newCommitteeId\);\s*const specialist = comm\?\.specialist \|\| "";\s*const members = allMembers\.filter\(m => m\.committeeId === newCommitteeId\)\.map\(m => m\.name\);\s*return Array\.from\(new Set\(\[specialist, \.\.\.members\]\.filter\(Boolean\)\)\);\s*\}, \[committees, allMembers, newCommitteeId\]\);/m;
  const newMemo = `const availableAssignees = React.useMemo(() => {
    const comm = committees.find(c => c.id === newCommitteeId);
    const specialist = comm?.specialist ? \`أخصائي اللجنة - \${comm.specialist}\` : "";
    const members = allMembers.filter(m => m.committeeId === newCommitteeId).map(m => \`\${m.role} - \${m.title} \${m.name}\`);
    return Array.from(new Set([specialist, ...members].filter(Boolean)));
  }, [allMembers, committees, newCommitteeId]);`;

  if (oldMemoRegex.test(content)) {
    content = content.replace(oldMemoRegex, newMemo);
    console.log('Fixed assignees in ' + filepath);
  } else {
    console.log('Regex did not match in ' + filepath);
  }

  fs.writeFileSync(filepath, content, 'utf8');
});
