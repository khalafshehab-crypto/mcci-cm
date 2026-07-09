import fs from 'fs';
let text = fs.readFileSync('src/pages/CommitteesHome.tsx', 'utf8');

text = text.replace(
  /const realEvents = evts.filter\(\(e: any\) => !e.recommendationClassification\);/,
  "const realEvents = evts.filter((e: any) => !e.recommendationType && !e.recommendationClassification);"
);

fs.writeFileSync('src/pages/CommitteesHome.tsx', text);
