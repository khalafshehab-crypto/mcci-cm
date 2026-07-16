const fs = require('fs');
let content = fs.readFileSync('src/components/GoogleWorkspaceCenter.tsx', 'utf8');

const replacement = `      const rootFolderId = await getOrCreateFolder("تقرير اللجان القطاعية الـ 22");
      const subRootFolderId = await getOrCreateFolder("اللجان المعتمدة", rootFolderId);
      const commFolderId = await getOrCreateFolder(committee.name, subRootFolderId);
      const result = await uploadFileToDrive(fileName, fileContent, "text/plain", commFolderId);`;

const regex = /const rootFolderId = await getOrCreateFolder\("تقرير اللجان للدورة الـ 22"\);[\s\S]*?const commFolderId = await getOrCreateFolder\(committee\.name, rootFolderId\);[\s\S]*?const result = await uploadFileToDrive\(fileName, fileContent, "text\/plain", commFolderId\);/;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/GoogleWorkspaceCenter.tsx', content);
  console.log("Patched GoogleWorkspaceCenter 2");
} else {
  console.log("Could not find block in GoogleWorkspaceCenter 2");
}
