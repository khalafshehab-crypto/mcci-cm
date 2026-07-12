const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

code = code.replace(/const myRecs = allRecs\.filter\(\(r: any\) => r && advancedMatch\(r\.committeeName || r\.dept, comm\.name\)\);/,
  `const myRecs = allRecs.filter((r: any) => {
        if (!r) return false;
        const belongsByName = advancedMatch(r.committeeName || r.dept, comm.name);
        const belongsById = String(r.committeeId) === String(comm.id);
        const ev = allEvents.find((e: any) => String(e.id) === String(r.eventId) || (r.eventName && e.title === r.eventName));
        const belongsViaEvent = ev && (String(ev.committeeId) === String(comm.id) || advancedMatch(ev.committeeName, comm.name));
        return belongsByName || belongsById || belongsViaEvent;
      });`);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
