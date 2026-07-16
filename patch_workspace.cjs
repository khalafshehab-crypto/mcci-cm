const fs = require('fs');
let content = fs.readFileSync('src/components/GoogleWorkspaceCenter.tsx', 'utf8');

const regex = /const rootFolderId = await getOrCreateFolder\("تقرير اللجان للدورة الـ 22"\);\s+const commFolderId = await getOrCreateFolder\(committee\.name, rootFolderId\);/;
const replacement = `const rootFolderId = await getOrCreateFolder("تقرير إدارة اللجان للدورة الـ 22");
      const approvedFolderId = await getOrCreateFolder("اللجان المعتمدة", rootFolderId);
      const statusFolderId = await getOrCreateFolder(committee.active !== false ? "الفعالة" : "غير الفعالة", approvedFolderId);
      const commFolderId = await getOrCreateFolder(committee.name, statusFolderId);`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/GoogleWorkspaceCenter.tsx', content);
  console.log("Patched GoogleWorkspaceCenter");
} else {
  console.log("Regex not found in GoogleWorkspaceCenter");
}
