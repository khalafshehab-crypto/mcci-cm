const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const regex = /\/\/ Get or Create Folders[\s\S]*?const rootFolderId = await getOrCreateFolder\([\s\S]*?memberFolderId = await getOrCreateFolder\(name\.trim\(\), commFolderId\);/;
const replacement = `// Get or Create Folders
        const rootFolderId = await getOrCreateFolder("تقرير إدارة اللجان للدورة الـ 22");
        const approvedFolderId = await getOrCreateFolder("اللجان المعتمدة", rootFolderId);
        // We use matchedComm.active to check if active
        const statusFolderId = await getOrCreateFolder(matchedComm.active ? "الفعالة" : "غير الفعالة", approvedFolderId);
        const commFolderId = await getOrCreateFolder(matchedComm.name, statusFolderId);
        const membersFolderId = await getOrCreateFolder("أعضاء اللجنة", commFolderId);
        memberFolderId = await getOrCreateFolder(name.trim(), membersFolderId);`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
  console.log("Patched CommitteesMembers");
} else {
  console.log("Regex not found in CommitteesMembers");
}
