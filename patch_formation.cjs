const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const regex = /const rootFolderId = await getOrCreateFolder\([\s\S]*?folderId = await getOrCreateFolder\(name\.trim\(\), rootFolderId\);/;
const replacement = `const rootFolderId = await getOrCreateFolder("تقرير إدارة اللجان للدورة الـ 22");
        const approvedFolderId = await getOrCreateFolder("اللجان المعتمدة", rootFolderId);
        const statusFolderId = await getOrCreateFolder(isActive ? "الفعالة" : "غير الفعالة", approvedFolderId);
        folderId = await getOrCreateFolder(name.trim(), statusFolderId);`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
  console.log("Patched CommitteesFormation");
} else {
  console.log("Regex not found in CommitteesFormation");
}
