const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const t = `const commMembers = (dbMembers || []).filter((m: any) => String(m.committeeId) === String(detailsComm.id) || advancedMatch(m.committeeName, detailsComm.name));`;
const r = `const commMembers = (dbMembers || []).filter((m: any) => String(m.committeeId) === String(detailsComm.id) || advancedMatch(m.committeeName, detailsComm.name) || String(m.secondaryCommitteeId) === String(detailsComm.id) || (m.secondaryCommitteeName && advancedMatch(m.secondaryCommitteeName, detailsComm.name)));`;
code = code.replace(t, r);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
console.log("Updated Details commMembers");
