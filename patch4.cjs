const fs = require('fs');
let content = fs.readFileSync('src/pages/Events.tsx', 'utf8');

const regex = /selectedClassificationForCards === null && selectedEventKindForCards === "اجتماع"\s*\?\s*\(/m;
const replacement = `selectedClassificationForCards === null ? (`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/Events.tsx', content);
  console.log("Patched Events.tsx Level 3 condition");
} else {
  console.log("Regex did not match Events.tsx Level 3 condition.");
}

const filterRegex = /const finalList = filteredEvents\.filter\([\s\S]*?getEventClassification\(e\.title\) === selectedClassificationForCards\)\s*\);/m;
const filterReplacement = `const finalList = filteredEvents.filter(
                  (e) =>
                    e.committeeId === selectedCommIdForCards &&
                    getEventKindStr(e.title) === selectedEventKindForCards &&
                    getEventClassification(e.title) === selectedClassificationForCards
                );`;

if (filterRegex.test(content)) {
  content = content.replace(filterRegex, filterReplacement);
  fs.writeFileSync('src/pages/Events.tsx', content);
  console.log("Patched Events.tsx filter logic");
} else {
  console.log("Regex did not match Events.tsx filter logic.");
}

