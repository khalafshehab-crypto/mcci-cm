const fs = require('fs');

function patchFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add check to generateDates
    content = content.replace(
        /const commName = committees\.find\(c => c\.id === newCommitteeId\)\?\.name \|\| "";/g,
        `if (!newCommitteeId || newCommitteeId === 0) { alert("يرجى اختيار اللجنة أولاً"); return; }\n    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";`
    );
    
    fs.writeFileSync(file, content);
}

patchFile('src/pages/CommitteesEvents.tsx');
patchFile('src/pages/CommitteesRecommendations.tsx');

