const fs = require('fs');
const files = [
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  const startStr = 'if (evt.type === "مفردة") {';
  const endStr = 'setIsAddOpen(true);';
  
  const startIdx = code.indexOf(startStr);
  const endIdx = code.indexOf(endStr, startIdx);
  
  if (startIdx !== -1 && endIdx !== -1) {
    const replaceBlock = `if (evt.type === "مفردة") {
      setSingleTime(evt.time || "");
      setSingleRoom(evt.location || "");
      setSingleEmployee(evt.employees?.[0] || "");
    } else {
      setSeriesTime(evt.time || "");
      setSeriesRooms((evt.location || "").split("،").map(s => s.trim()));
      setSeriesAssignedEmployee(evt.employees?.[0] || "");
    }
    
    `;
    code = code.slice(0, startIdx) + replaceBlock + code.slice(endIdx);
    fs.writeFileSync(file, code);
  }
}
console.log("Fixed handleOpenEdit in other 3 files accurately");
