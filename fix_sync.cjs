const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const target1 = `const myMbrs = allMembers.filter((m: any) => m && (String(m.committeeId) === String(comm.id) || advancedMatch(m.committeeName, comm.name)));`;
const replacement1 = `const myMbrs = allMembers.filter((m: any) => m && (
            String(m.committeeId) === String(comm.id) || 
            advancedMatch(m.committeeName, comm.name) ||
            String(m.secondaryCommitteeId) === String(comm.id) ||
            (m.secondaryCommitteeName && advancedMatch(m.secondaryCommitteeName, comm.name))
          ));`;
code = code.replace(target1, replacement1);

const target2 = `const myMbrs = allMembers.filter((m: any) => m && (String(m.committeeId) === String(comm.id) || advancedMatch(m.committeeName, comm.name)));`;
const replacement2 = `const myMbrs = allMembers.filter((m: any) => m && (
        String(m.committeeId) === String(comm.id) || 
        advancedMatch(m.committeeName, comm.name) ||
        String(m.secondaryCommitteeId) === String(comm.id) ||
        (m.secondaryCommitteeName && advancedMatch(m.secondaryCommitteeName, comm.name))
      ));`;
code = code.replace(target2, replacement2);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
console.log("Sync fixed");
