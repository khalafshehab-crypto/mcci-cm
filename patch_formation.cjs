const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const replacement = `        const rootFolderId = await getOrCreateFolder("تقرير اللجان القطاعية الـ 22");
        const subRootFolderId = await getOrCreateFolder("اللجان المعتمدة", rootFolderId);
        folderId = await getOrCreateFolder(name.trim(), subRootFolderId);`;

const regex = /const rootFolderId = await getOrCreateFolder\("تقرير اللجان للدورة الـ 22"\);[\s\S]*?folderId = await getOrCreateFolder\(name\.trim\(\), rootFolderId\);/;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
  console.log("Patched CommitteesFormation");
} else {
  console.log("Could not find block in CommitteesFormation");
}
