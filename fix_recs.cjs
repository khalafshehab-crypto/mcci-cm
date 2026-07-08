const fs = require('fs');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Replace agendaRecs definition and combinedRecs
  // We'll just replace everything from "const agendaRecs = " to "const combinedRecs = [...dbRecommendations, ...agendaRecs];"
  // with "const combinedRecs = dbRecommendations;"

  content = content.replace(/const agendaRecs = \(chosenEvent\.agenda \|\| \[\]\)[\s\S]*?const combinedRecs = \[\.\.\.dbRecommendations, \.\.\.agendaRecs\];/, 'const combinedRecs = dbRecommendations;');
  
  fs.writeFileSync(filepath, content, 'utf8');
}

fixFile('src/pages/CommitteesRecommendations.tsx');
fixFile('src/pages/Recommendations.tsx');
console.log('Fixed recs');
