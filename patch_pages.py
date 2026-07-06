import re

# Patch AssistantSecGenEvents.tsx
with open('src/pages/AssistantSecGenEvents.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('CommitteesEvents', 'AssistantSecGenEvents')
content = content.replace('useFirestoreCollection<EventItem>("events", [])', 'useFirestoreCollection<EventItem>("assistant_sec_gen_events", [])')
content = content.replace('addDoc(collection(db, "events"),', 'addDoc(collection(db, "assistant_sec_gen_events"),')

with open('src/pages/AssistantSecGenEvents.tsx', 'w', encoding='utf-8') as f:
    f.write(content)


# Patch AssistantSecGenTasks.tsx
with open('src/pages/AssistantSecGenTasks.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('CommitteesTasks', 'AssistantSecGenTasks')
content = content.replace('collection(db, "tasks")', 'collection(db, "assistant_sec_gen_tasks")')
content = content.replace('useFirestoreCollection<any>("tasks", [])', 'useFirestoreCollection<any>("assistant_sec_gen_tasks", [])')

with open('src/pages/AssistantSecGenTasks.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
