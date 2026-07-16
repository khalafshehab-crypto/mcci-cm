const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf8');

const replacement = `        const rootFolderId = await getOrCreateFolder("تقرير اللجان القطاعية الـ 22");
        const subRootFolderId = await getOrCreateFolder("اللجان المعتمدة", rootFolderId);
        const committeeFolderId = await getOrCreateFolder(evt.committeeName || "عام", subRootFolderId);
        const eventsRootFolderId = await getOrCreateFolder("الاجتماعات والفعاليات", committeeFolderId);
        
        const isMeeting = evt.title && evt.title.includes("اجتماع");
        const classificationFolderName = isMeeting ? "اجتماعات اللجنة" : "الفعاليات";
        
        const classificationFolderId = await getOrCreateFolder(classificationFolderName, eventsRootFolderId);
        const itemFolderId = await getOrCreateFolder(evt.title || "بدون عنوان", classificationFolderId);`;

const regex = /const rootFolderId = await getOrCreateFolder\("أرشيف اللجان - الدورة 22"\);[\s\S]*?const itemFolderId = await getOrCreateFolder\(evt\.title \|\| "بدون عنوان", recFolderId\);/;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', content);
  console.log("Patched CommitteesRecommendations");
} else {
  console.log("Could not find block in CommitteesRecommendations");
}
