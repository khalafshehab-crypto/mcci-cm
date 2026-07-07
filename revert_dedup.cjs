const fs = require('fs');

function patch(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const searchStr = `const { data: rawEventsData, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<EventItem>("events", []);
  const events = React.useMemo(() => {
    const map = new Map();
    for (const e of rawEventsData) {
      map.set(String(e.id), e);
    }
    return Array.from(map.values());
  }, [rawEventsData]);`;

    const replaceStr = `const { data: events, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<EventItem>("events", []);`;

    if(content.includes(searchStr)) {
        content = content.replace(searchStr, replaceStr);
        fs.writeFileSync(filePath, content);
        console.log("Reverted", filePath);
    }
}

patch('src/pages/Recommendations.tsx');
patch('src/pages/CommitteesRecommendations.tsx');
patch('src/pages/CommitteesEvents.tsx');
patch('src/pages/Events.tsx');
