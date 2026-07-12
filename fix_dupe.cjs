const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');
let start = code.indexOf("  const availableAssignees = React.useMemo(() => {\n    const comm = committees.find(c => String(c.id) === String(newCommitteeId));");
let end = code.indexOf("  const availableAssignees = React.useMemo(() => {\n    const comm = committees.find(c => c.id === newCommitteeId);");
if (start !== -1 && end !== -1) {
   code = code.substring(0, start) + code.substring(end);
   fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', code);
   console.log("Fixed dupe");
} else {
   console.log("Not found start: ", start, " end: ", end);
}
