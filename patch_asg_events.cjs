const fs = require('fs');
let content = fs.readFileSync('src/pages/AssistantSecGenEvents.tsx', 'utf8');

const replacement = `  const { data: events1, addDocument: addFirebaseEvent1, updateDocument: updateFirebaseEvent1, deleteDocument: deleteFirebaseEvent1 } = useFirestoreCollection<EventItem>("assistant_sec_gen_events", []);
  const { data: events2, updateDocument: updateFirebaseEvent2, deleteDocument: deleteFirebaseEvent2 } = useFirestoreCollection<EventItem>("events", []);
  const { data: events3, updateDocument: updateFirebaseEvent3, deleteDocument: deleteFirebaseEvent3 } = useFirestoreCollection<EventItem>("affiliates_events", []);
  const { data: events4, updateDocument: updateFirebaseEvent4, deleteDocument: deleteFirebaseEvent4 } = useFirestoreCollection<EventItem>("centers_events", []);

  const events = React.useMemo(() => {
    return [
      ...events1.map(e => ({ ...e, _sourceCol: "assistant_sec_gen_events" })),
      ...events2.map(e => ({ ...e, _sourceCol: "events" })),
      ...events3.map(e => ({ ...e, _sourceCol: "affiliates_events" })),
      ...events4.map(e => ({ ...e, _sourceCol: "centers_events" }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events1, events2, events3, events4]);

  const addFirebaseEvent = addFirebaseEvent1;

  const updateFirebaseEvent = (id: string, updates: any) => {
    const e = events.find(ev => String(ev.id) === String(id));
    if (!e) return;
    const col = (e as any)._sourceCol;
    if (col === "assistant_sec_gen_events") updateFirebaseEvent1(id, updates);
    else if (col === "events") updateFirebaseEvent2(id, updates);
    else if (col === "affiliates_events") updateFirebaseEvent3(id, updates);
    else if (col === "centers_events") updateFirebaseEvent4(id, updates);
  };

  const deleteFirebaseEvent = (id: string) => {
    const e = events.find(ev => String(ev.id) === String(id));
    if (!e) return;
    const col = (e as any)._sourceCol;
    if (col === "assistant_sec_gen_events") deleteFirebaseEvent1(id);
    else if (col === "events") deleteFirebaseEvent2(id);
    else if (col === "affiliates_events") deleteFirebaseEvent3(id);
    else if (col === "centers_events") deleteFirebaseEvent4(id);
  };`;

content = content.replace(
  /  const \{ data: events, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent \} = useFirestoreCollection<EventItem>\("assistant_sec_gen_events", \[\]\);/,
  replacement
);

// We need to import useFirestoreCollection if it is not already correctly structured, wait it is imported via hooks?
// Wait, is useFirestoreCollection imported in AssistantSecGenEvents.tsx?
// "import { useFirestoreCollection } from '../hooks/useFirestoreCollection';" -> probably.

fs.writeFileSync('src/pages/AssistantSecGenEvents.tsx', content);
