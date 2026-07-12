const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// First, remove the advancedMatch inside CommitteeDetailsModalContent
code = code.replace(/  const advancedMatch = \(commName: string, targetName: string\) => \{[\s\S]*?  \};\n/g, '');

// Then add it at the top level
const advancedMatchDef = `
const advancedMatch = (commName: string, targetName: string) => {
  if (!commName || !targetName) return false;
  const clean = (s: string) => s.replace(/لجنة/g, "").replace(/الـ/g, "").replace(/ال/g, "").replace(/\\s+/g, " ").trim();
  const c1 = clean(commName);
  const c2 = clean(targetName);
  if (c1.includes(c2) || c2.includes(c1)) return true;
  const w1 = c1.split(" ").filter(w => w.length >= 3);
  const w2 = c2.split(" ").filter(w => w.length >= 3);
  return w1.some(word => w2.some(other => other.includes(word) || word.includes(other)));
};
`;

code = code.replace('import { cascadeCommitteeRename, cascadeCommitteeDelete } from \'../lib/cascadeUpdates\';', 
  'import { cascadeCommitteeRename, cascadeCommitteeDelete } from \'../lib/cascadeUpdates\';\n' + advancedMatchDef);

// Now update the filters
code = code.replace(/const commMembers = \(dbMembers \|\| \[\]\)\.filter\(\(m: any\) => String\(m\.committeeId\) === String\(detailsComm\.id\) \|\| m\.committeeName === detailsComm\.name\);/,
  `const commMembers = (dbMembers || []).filter((m: any) => String(m.committeeId) === String(detailsComm.id) || advancedMatch(m.committeeName, detailsComm.name));`);

code = code.replace(/const commEvents = \(dbEvents \|\| \[\]\)\.filter\(\(e: any\) => \(String\(e\.committeeId\) === String\(detailsComm\.id\) \|\| e\.committeeName === detailsComm\.name\) && !e\.recommendationClassification\);/,
  `const commEvents = (dbEvents || []).filter((e: any) => (String(e.committeeId) === String(detailsComm.id) || advancedMatch(e.committeeName, detailsComm.name)) && !e.recommendationClassification);`);

code = code.replace(/const myMbrs = allMembers\.filter\(\(m: any\) => m && String\(m\.committeeId\) === String\(comm\.id\)\);/,
  `const myMbrs = allMembers.filter((m: any) => m && (String(m.committeeId) === String(comm.id) || advancedMatch(m.committeeName, comm.name)));`);

code = code.replace(/const myEvts = allEvents\.filter\(\(e: any\) => e && String\(e\.committeeId\) === String\(comm\.id\)\);/,
  `const myEvts = allEvents.filter((e: any) => e && (String(e.committeeId) === String(comm.id) || advancedMatch(e.committeeName, comm.name)));`);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
