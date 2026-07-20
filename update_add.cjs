const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const searchString = `        committeeId: selectedCommitteeId,
        committeeName: matchedComm.name,
        joiningMechanism: joiningMechanism,`;

const replacementString = `        committeeId: selectedCommitteeId,
        committeeName: matchedComm.name,
        secondaryCommitteeId: secondaryCommitteeId && String(secondaryCommitteeId) !== "0" ? secondaryCommitteeId : undefined,
        secondaryCommitteeName: matchedSecondaryComm ? matchedSecondaryComm.name : undefined,
        joiningMechanism: joiningMechanism,`;

code = code.replace(searchString, replacementString);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Updated add case");
