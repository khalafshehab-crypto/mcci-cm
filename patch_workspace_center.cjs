const fs = require('fs');
let content = fs.readFileSync('src/components/GoogleWorkspaceCenter.tsx', 'utf8');

const replacement = `      const rootFolderId = await getOrCreateFolder("تقرير اللجان للدورة الـ 22");
      const commFolderId = await getOrCreateFolder(committee.name, rootFolderId);
      const result = await uploadFileToDrive(fileName, fileContent, "text/plain", commFolderId);`;

const regex = /const result = await uploadFileToDrive\(fileName, fileContent, "text\/plain"\);/;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/GoogleWorkspaceCenter.tsx', content);
  console.log("Patched GoogleWorkspaceCenter");
} else {
  console.log("Could not find uploadFileToDrive in GoogleWorkspaceCenter");
}
