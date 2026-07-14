const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');

const targetStr = `            reader.onload = () => resolve(reader.result.split(',')[1]);`;
const repStr = `            reader.onload = () => resolve((reader.result as string).split(',')[1]);`;

content = content.replace(targetStr, repStr);

const targetStr2 = `          const res = await uploadBinaryFileToDrive(file.name, base64, file.type || "application/octet-stream", itemFolderId);`;
const repStr2 = `          const res = await uploadBinaryFileToDrive(file.name, base64 as string, file.type || "application/octet-stream", itemFolderId);`;

content = content.replace(targetStr2, repStr2);
fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', content);
