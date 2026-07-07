const fs = require('fs');

function patch(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // For alarms:
    content = content.replace(/setAlarms\(list\);/g, 'setAlarms(Array.from(new Map(list.map(a => [a.id, a])).values()));');
    
    // For liveSchedule (if exists in this file):
    content = content.replace(/setLiveSchedule\(list\);/g, 'setLiveSchedule(Array.from(new Map(list.map(a => [a.id, a])).values()));');

    fs.writeFileSync(filePath, content);
    console.log("Patched", filePath);
}

patch('src/pages/CommitteesHome.tsx');
patch('src/pages/Home.tsx');
