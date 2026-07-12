const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

code = code.replace(/agendaRecs\.forEach\(ar => \{\s*if \(\!mappedDbMap\.has\(ar\.id\)\) \{\s*allRecs\.push\(ar\);\s*\}\s*\}\);/,
  `agendaRecs.forEach(ar => {
        if (!mappedDbMap.has(ar.id)) {
           allRecs.push(ar);
        } else {
           const existing = mappedDbMap.get(ar.id);
           existing.eventId = existing.eventId || ar.eventId;
           existing.committeeId = existing.committeeId || ar.committeeId;
           existing.committeeName = existing.committeeName || ar.committeeName;
           existing.eventName = existing.eventName || ar.eventName;
        }
      });`);

code = code.replace(/agendaRecsModal\.forEach\(\(ar: any\) => \{\s*if \(\!mappedDbMapModal\.has\(ar\.id\)\) \{\s*allRecsModal\.push\(ar\);\s*\}\s*\}\);/,
  `agendaRecsModal.forEach((ar: any) => {
    if (!mappedDbMapModal.has(ar.id)) {
       allRecsModal.push(ar);
    } else {
       const existing = mappedDbMapModal.get(ar.id);
       existing.eventId = existing.eventId || ar.eventId;
       existing.committeeId = existing.committeeId || ar.committeeId;
       existing.committeeName = existing.committeeName || ar.committeeName;
       existing.eventName = existing.eventName || ar.eventName;
    }
  });`);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
