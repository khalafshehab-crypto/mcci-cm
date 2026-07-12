const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

code = code.replace(
  'const realRecommendationsCount = myRecs.length;',
  `const realRecommendationsCount = myRecs.length;
          console.log("COMMITTEE SYNC:", comm.name, "Events:", realEventsCount, "Recs:", realRecommendationsCount, "agendaRecs:", agendaRecs.length, "allRecs:", allRecs.length);`
);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
