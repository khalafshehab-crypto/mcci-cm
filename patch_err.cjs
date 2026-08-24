const fs = require('fs');
let libContent = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

// Ensure that alert displays the error properly
libContent = libContent.replace(
  /alert\("حدث خطأ أثناء التوليد الذكي"\);/g,
  `const errData = await response.json().catch(() => ({})); alert(errData.error || "حدث خطأ أثناء التوليد الذكي");`
);
fs.writeFileSync('src/pages/CommitteesLibrary.tsx', libContent);
