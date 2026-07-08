const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');

const regex = /const finalList = filteredEvents\.filter\([\s\S]*?getEventClassification\(e\.title\) === selectedClassificationForCards\)\s*\);/m;

const replacement = `const finalList = filteredEvents.filter(
                  (e) =>
                    e.committeeId === selectedCommIdForCards &&
                    getEventKindStr(e.title) === selectedEventKindForCards &&
                    getEventClassification(e.title) === selectedClassificationForCards
                );`;

if (regex.test(content)) {
  fs.writeFileSync('src/pages/CommitteesEvents.tsx', content.replace(regex, replacement));
  console.log("Patched filter successfully!");
} else {
  console.log("Regex did not match.");
}
