const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const replacement = `        const rootFolderId = await getOrCreateFolder("تقرير اللجان القطاعية الـ 22");
        const subRootFolderId = await getOrCreateFolder("اللجان المعتمدة", rootFolderId);
        const commFolderId = await getOrCreateFolder(matchedComm.name, subRootFolderId);
        const membersRootFolderId = await getOrCreateFolder("أعضاء اللجنة", commFolderId);
        memberFolderId = await getOrCreateFolder(name.trim(), membersRootFolderId);`;

const regex = /const rootFolderId = await getOrCreateFolder\("تقرير اللجان للدورة الـ 22"\);[\s\S]*?memberFolderId = await getOrCreateFolder\(name\.trim\(\), commFolderId\);/;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
  console.log("Patched CommitteesMembers");
} else {
  console.log("Could not find block in CommitteesMembers");
}
