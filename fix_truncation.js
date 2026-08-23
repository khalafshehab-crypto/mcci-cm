const fs = require('fs');

function checkTags(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  // simplistic tag checker
  // we can use a library if available, but for now just output the last 100 lines
  console.log("===", filename, "===");
}

checkTags('src/pages/Recommendations.tsx');
