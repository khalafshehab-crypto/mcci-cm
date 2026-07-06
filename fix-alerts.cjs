const fs = require('fs');

function removeAlerts(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove the alert from useEffect hooks. We'll remove it entirely where it was added
    // except we want to KEEP it in generateDates, handleInsertSeries, handleFormSubmit (button click handlers)
    // Actually, maybe it's better to just write a script that replaces the whole line if it's inside useEffect, or just remove it everywhere and re-add carefully.

    // Let's just do a specific replacement.
    const alertStr = `if (!newCommitteeId || newCommitteeId === 0) { alert("يرجى اختيار اللجنة أولاً"); return; }\\n    `;
    
    content = content.replace(/      if \(\!newCommitteeId \|\| newCommitteeId === 0\) \{ alert\("يرجى اختيار اللجنة أولاً"\); return; \}\n    const commName = committees\.find/g, "      const commName = committees.find");

    fs.writeFileSync(file, content);
}

removeAlerts('src/pages/CommitteesEvents.tsx');
removeAlerts('src/pages/CommitteesRecommendations.tsx');
