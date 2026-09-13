const fs = require('fs');
const files = [
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  const handleOpenEditStart = code.indexOf('const handleOpenEdit = (evt: EventItem) => {');
  if (handleOpenEditStart === -1) continue;

  const replaceBlock = `
    if (evt.type === "مفردة") {
      setSingleTime(evt.time || "");
      setSingleRoom(evt.location || "");
      setSingleEmployee(evt.employees?.[0] || "");
    } else {
      setSeriesTime(evt.time || "");
      setSeriesRooms((evt.location || "").split("،").map(s => s.trim()));
      setSeriesAssignedEmployee(evt.employees?.[0] || "");
    }
`;

  const regex = /if\s*\(evt\.type\s*===\s*"مفردة"\)\s*\{[\s\S]*?\} else \{[\s\S]*?\}/;
  
  const afterHandleOpenEdit = code.slice(handleOpenEditStart);
  const modifiedAfter = afterHandleOpenEdit.replace(regex, replaceBlock.trim());
  
  code = code.slice(0, handleOpenEditStart) + modifiedAfter;
  fs.writeFileSync(file, code);
}
console.log("Fixed handleOpenEdit in other 3 files");
