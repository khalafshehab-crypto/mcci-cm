import fs from 'fs';
let text = fs.readFileSync('src/pages/CommitteesHome.tsx', 'utf8');

text = text.replace(
  /meetingsCount = realEvents.filter\(\(e: any\) => e.type === "اجتماع" \|\| e.type === "لقاء" \|\| e.category === "event"\).length;/,
  'meetingsCount = realEvents.filter((e: any) => e.type === "اجتماع" || e.type === "لقاء" || e.category === "event").length;'
); // Wait, this is already using realEvents.

fs.writeFileSync('src/pages/CommitteesHome.tsx', text);
