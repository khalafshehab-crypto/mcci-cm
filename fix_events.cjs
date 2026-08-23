const fs = require('fs');
let text = fs.readFileSync('src/pages/Events.tsx', 'utf8');
text = text.replace(
  'const { data: events, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<EventItem>("events", []);\n  const { data: rawCentersEvents } = useFirestoreCollection<EventItem>("centers_events", []);\n  const { data: rawAssistantEvents } = useFirestoreCollection<EventItem>("assistant_sec_gen_events", []);',
  'const { data: rawEvents, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<EventItem>("events", []);\n  const { data: rawCentersEvents } = useFirestoreCollection<EventItem>("centers_events", []);\n  const { data: rawAssistantEvents } = useFirestoreCollection<EventItem>("assistant_sec_gen_events", []);\n  const { data: rawAffiliatesEvents } = useFirestoreCollection<EventItem>("affiliates_events", []);'
);
fs.writeFileSync('src/pages/Events.tsx', text);
