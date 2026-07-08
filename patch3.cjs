const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf8');

content = content.replace(
  'const commEvents = events.filter((e) => e.committeeId === selectedCommIdForCards && !e.exportedRecommendationsToPage);',
  'const commEvents = events.filter((e) => e.committeeId === selectedCommIdForCards && (!e.recommendationType && !e.recommendationClassification));'
);

content = content.replace(
  'const standaloneRecs = events.filter((e) => e.committeeId === selectedCommIdForCards && e.exportedRecommendationsToPage);',
  'const standaloneRecs = events.filter((e) => e.committeeId === selectedCommIdForCards && !!e.recommendationType);'
);

content = content.replace(
  'const commSessions = events.filter((e) => e.committeeId === comm.id && !e.exportedRecommendationsToPage);',
  'const commSessions = events.filter((e) => e.committeeId === comm.id && (!e.recommendationType && !e.recommendationClassification));'
);

content = content.replace(
  'const standaloneRecsCount = events.filter((e) => e.committeeId === comm.id && e.exportedRecommendationsToPage).length;',
  'const standaloneRecsCount = events.filter((e) => e.committeeId === comm.id && !!e.recommendationType).length;'
);

fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', content);
console.log("Patched Recommendations page");
