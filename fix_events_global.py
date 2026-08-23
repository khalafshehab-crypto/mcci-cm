import re

file_path = 'src/pages/Events.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# We want to import the other collections and merge them into `events`
# Original:
# const { data: events, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<EventItem>("events", []);

pattern = r'const \{ data: events, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent \} = useFirestoreCollection<EventItem>\("events", \[\]\);'

replacement = """const { data: rawEvents, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<EventItem>("events", []);
  const { data: rawAffiliatesEvents } = useFirestoreCollection<EventItem>("affiliates_events", []);
  const { data: rawCentersEvents } = useFirestoreCollection<EventItem>("centers_events", []);
  const { data: rawAssistantEvents } = useFirestoreCollection<EventItem>("assistant_sec_gen_events", []);
  
  const events = React.useMemo(() => {
    return [
      ...rawEvents,
      ...rawAffiliatesEvents,
      ...rawCentersEvents,
      ...rawAssistantEvents
    ];
  }, [rawEvents, rawAffiliatesEvents, rawCentersEvents, rawAssistantEvents]);"""

if re.search(pattern, content):
    content = re.sub(pattern, replacement, content)
    print("Updated global Events.tsx to fetch from all collections.")

with open(file_path, 'w') as f:
    f.write(content)

