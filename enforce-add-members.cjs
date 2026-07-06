const fs = require('fs');

let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

content = content.replace(
    /const matchedComm = allCommittees\.find\(c => c\.id === Number\(selectedCommitteeId\)\) \|\| \{ name: "لجنة" \};/g,
    `const matchedComm = allCommittees.find(c => c.id === Number(selectedCommitteeId)) || { name: "لجنة" };\n    if (matchedComm && matchedComm.name !== "لجنة" && !canUserEditCommittee(matchedComm.name)) { alert("غير مصرح لك بإضافة أعضاء لهذه اللجنة"); return; }`
);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
