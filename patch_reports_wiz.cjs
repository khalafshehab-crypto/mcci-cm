const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf-8');

// The issue is that wizSearchFoundItems is not being displayed in Step 2.
// Let's find how Step 2 renders.
const step2Regex = /\{wizardStep === 2 && \([\s\S]*?\}\s*\)\}/;
const match = code.match(step2Regex);
if(match) {
  console.log("Found Step 2");
} else {
  console.log("Could not find Step 2");
}

