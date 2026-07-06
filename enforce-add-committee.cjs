const fs = require('fs');

let content = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');

if (!content.includes('if (!canUserEditCommittee(commName))')) {
    content = content.replace(
        /const commName = committees\.find\(c => c\.id === newCommitteeId\)\?\.name \|\| "";/g,
        `const commName = committees.find(c => c.id === newCommitteeId)?.name || "";\n    if (commName && !canUserEditCommittee(commName)) { alert("غير مصرح لك بجدولة فعاليات لهذه اللجنة"); return; }`
    );
    fs.writeFileSync('src/pages/CommitteesEvents.tsx', content);
}
