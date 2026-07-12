const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

code = code.replace(/const commRecs = allRecsModal\.filter\(\(r: any\) => \{[\s\S]*?return advancedMatch\(r\.committeeName \|\| r\.dept, detailsComm\.name\) \|\| event;\n  \}\);/, 
  `const commRecs = allRecsModal.filter((r: any) => {
     if (!r) return false;
     const belongsByName = advancedMatch(r.committeeName || r.dept, detailsComm.name);
     const belongsById = String(r.committeeId) === String(detailsComm.id);
     const ev = (dbEvents || []).find((e: any) => String(e.id) === String(r.eventId) || (r.eventName && e.title === r.eventName));
     const belongsViaEvent = ev && (String(ev.committeeId) === String(detailsComm.id) || advancedMatch(ev.committeeName, detailsComm.name));
     return belongsByName || belongsById || belongsViaEvent;
  });`);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
