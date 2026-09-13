const fs = require('fs');

const files = [
  '/app/applet/src/pages/CommitteesEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /setSingleEventNumber\(""\);\s*\/\/\s*Or\s*parse\s*it/,
    `// Parse singleEventNumber
    let matchedNumber = "";
    const ordinals = ["الصفر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون"];
    for (const ord of ordinals) {
      if (evt.title.includes(ord)) {
        matchedNumber = ord;
        break;
      }
    }
    setSingleEventNumber(matchedNumber);
    setIsSeqManuallyEdited(false);`
  );

  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}
