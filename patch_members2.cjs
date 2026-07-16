const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const regex = /const statusFolderId = await getOrCreateFolder\(matchedComm\.active \? "الفعالة" : "غير الفعالة", approvedFolderId\);/;
const replacement = `const statusFolderId = await getOrCreateFolder(matchedComm.active !== false ? "الفعالة" : "غير الفعالة", approvedFolderId);`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
  console.log("Patched CommitteesMembers");
} else {
  console.log("Regex not found in CommitteesMembers");
}
