const fs = require('fs');

let content = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf8');

content = content.replace(
    /const commName = committees\.find\(c => c\.id === (newCommitteeId|importCommitteeId)\)\?\.name \|\| "";/g,
    `const commName = committees.find(c => c.id === $1)?.name || "";\n    if (commName && !canUserEditCommittee(commName)) { alert("غير مصرح لك بجدولة فعاليات أو مهام لهذه اللجنة"); return; }`
);

fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', content);
