const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

code = code.replace(
  `const myMbrs = allMembers.filter((m: any) => m && String(m.committeeId) === String(comm.id));`,
  `const myMbrs = allMembers.filter((m: any) => m && (String(m.committeeId) === String(comm.id) || advancedMatch(m.committeeName, comm.name)));`
);

code = code.replace(
  `const myEvts = allEvents.filter((e: any) => e && String(e.committeeId) === String(comm.id));`,
  `const myEvts = allEvents.filter((e: any) => e && (String(e.committeeId) === String(comm.id) || advancedMatch(e.committeeName, comm.name)));`
);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
console.log("Replaced sync successfully!");
