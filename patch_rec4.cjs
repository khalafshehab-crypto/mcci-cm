const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');

const targetStr = `    isOpen: true,
    message: "الرجاء تأكيد مسار الحفظ والأرشفة في جوجل درايف:",`;

const index = content.indexOf(targetStr);
console.log("Found at index:", index);

if (index !== -1) {
  // we know it's inside the onChange
  // let's just replace the whole onChange
  let searchStart = content.lastIndexOf("onChange={(e) => {", index);
  let searchEnd = content.indexOf("}}", index) + 2;
  
  if (searchStart !== -1 && searchEnd !== -1) {
    const toReplace = content.substring(searchStart, searchEnd);
    const replacement = `onChange={(e) => {
                                                      if (e.target.files && e.target.files.length > 0) {
                                                        handleFileUploads(Array.from(e.target.files), evt, attachmentsList || []);
                                                      }
                                                    }}`;
    content = content.replace(toReplace, replacement);
    fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', content);
    console.log("Replaced!");
  }
}
