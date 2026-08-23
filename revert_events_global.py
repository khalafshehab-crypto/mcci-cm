import re

file_path = 'src/pages/Events.tsx'
with open(file_path, 'r') as f:
    content = f.read()

pattern = r'const \{ data: rawEvents, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent \} = useFirestoreCollection<EventItem>\("events", \[\]\);[\s\S]*?\]\);'

replacement = 'const { data: events, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<EventItem>("events", []);'

if re.search(pattern, content):
    content = re.sub(pattern, replacement, content)
    print("Reverted global Events.tsx")

with open(file_path, 'w') as f:
    f.write(content)

