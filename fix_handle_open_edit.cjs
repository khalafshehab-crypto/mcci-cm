const fs = require('fs');
const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // We want to replace the logic inside `if (evt.type === "مفردة") { ... } else { ... }` in handleOpenEdit
  // First, find `const handleOpenEdit = (evt: EventItem) => {`
  const handleOpenEditStart = code.indexOf('const handleOpenEdit = (evt: EventItem) => {');
  if (handleOpenEditStart === -1) continue;

  const replaceBlock = `
    if (evt.type === "مفردة") {
      setSingleTime(evt.time || "");
      setSingleRoom(evt.location || "");
      setSingleEmployee(evt.employees?.[0] || "");
      if (evt.employees && evt.employees.length > 1) {
        setSingleInviteesEnabled(true);
        setSingleInvitedEmployees(evt.employees.slice(1));
      } else {
        setSingleInviteesEnabled(false);
        setSingleInvitedEmployees([]);
      }
    } else {
      setSeriesTime(evt.time || "");
      setSeriesRooms((evt.location || "").split("،").map(s => s.trim()));
      setSeriesAssignedEmployee(evt.employees?.[0] || "");
      if (evt.employees && evt.employees.length > 1) {
        setSeriesInviteesEnabled(true);
        setSeriesInvitedEmployees(evt.employees.slice(1));
      } else {
        setSeriesInviteesEnabled(false);
        setSeriesInvitedEmployees([]);
      }
    }
`;

  const regex = /if\s*\(evt\.type\s*===\s*"مفردة"\)\s*\{[\s\S]*?\} else \{[\s\S]*?\}/;
  
  // Find where it is inside handleOpenEdit
  const afterHandleOpenEdit = code.slice(handleOpenEditStart);
  
  const modifiedAfter = afterHandleOpenEdit.replace(regex, replaceBlock.trim());
  
  code = code.slice(0, handleOpenEditStart) + modifiedAfter;
  fs.writeFileSync(file, code);
}
console.log("Fixed handleOpenEdit in all files");
