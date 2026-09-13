import re
import sys

def fix_file(filename, collection_name):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the `setEvents` function entirely
    content = re.sub(r'  const setEvents = \(action: React\.SetStateAction<EventItem\[\]>\) => \{.*?\n  \};\n', '', content, flags=re.DOTALL)

    # Fix handleInsertSeries
    content = content.replace(
        f'setEvents([...newEventsList, ...events]);',
        f'newEventsList.forEach(async (ev) => {{ await setDoc(doc(db, "{collection_name}", String(ev.id)), ev); }});'
    )

    # Fix handleSubmit editingEvent branch
    edit_regex = r'setEvents\(events\.map\(ev => ev\.id === editingEvent\.id \? updatedEvent : ev\)\);'
    edit_replacement = f'''try {{
        await updateDoc(doc(db, "{collection_name}", String(editingEvent.id)), updatedEvent);
      }} catch (err) {{
        console.error(err);
      }}'''
    content = re.sub(edit_regex, edit_replacement, content)

    # Fix handleSubmit newEvent branch
    new_regex = r'setEvents\(\[newEvent, \.\.\.events\]\);'
    new_replacement = f'''try {{
        await setDoc(doc(db, "{collection_name}", String(newEvent.id)), newEvent);
      }} catch (err) {{
        console.error(err);
      }}'''
    content = re.sub(new_regex, new_replacement, content)

    # Fix handleDelete
    delete_regex = r'setEvents\(events\.filter\(\(e\) => e\.id !== deletingEvent\.id\)\);'
    delete_replacement = f'''try {{
        await deleteDoc(doc(db, "{collection_name}", String(deletingEvent.id)));
      }} catch (err) {{
        console.error(err);
      }}'''
    content = re.sub(delete_regex, delete_replacement, content)

    # Make handleInsertSeries async
    content = content.replace('const handleInsertSeries = () => {', 'const handleInsertSeries = async () => {')

    # Make handleSubmit async
    content = content.replace('const handleSubmit = (e: FormEvent) => {', 'const handleSubmit = async (e: FormEvent) => {')

    # Make handleDelete async
    content = content.replace('const handleDelete = () => {', 'const handleDelete = async () => {')

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('src/pages/CommitteesEvents.tsx', 'events')
fix_file('src/pages/AffiliatesEvents.tsx', 'affiliates_events')
fix_file('src/pages/AssistantSecGenEvents.tsx', 'assistant_sec_gen_events')
fix_file('src/pages/CentersEvents.tsx', 'centers_events')
fix_file('src/pages/Events.tsx', 'events')
fix_file('src/pages/Recommendations.tsx', 'events')
fix_file('src/pages/CommitteesRecommendations.tsx', 'events')

print("Done fixing files")
