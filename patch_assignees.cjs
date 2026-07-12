const fs = require('fs');

const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `  const availableAssignees = React.useMemo(() => {
    const specialist = committees.find(c => c.id === newCommitteeId)?.specialist;
    const members = newMembers.map(mId => allMembers.find(m => m.id === mId)?.name);
    return Array.from(new Set([specialist, ...members].filter(Boolean)));
  }, [allMembers, committees, newCommitteeId]);`;
  
  const newFunction = `  const availableAssignees = React.useMemo(() => {
    const specialist = committees.find(c => c.id === newCommitteeId)?.specialist;
    const commMembers = allMembers.filter(m => m.committeeId === newCommitteeId).map(m => m.name);
    const members = newMembers.map(mId => allMembers.find(m => m.id === mId)?.name);
    return Array.from(new Set([specialist, ...commMembers, ...members].filter(Boolean)));
  }, [allMembers, committees, newCommitteeId, newMembers]);`;
  
  if (code.includes(target)) {
    code = code.replace(target, newFunction);
    fs.writeFileSync(filename, code);
    console.log("Patched CommitteesRecommendations.tsx (availableAssignees)");
  } else {
    console.log("availableAssignees block not found in CommitteesRecommendations.tsx");
  }
}
