import re

# Patch CentersEvents.tsx
with open('src/pages/CentersEvents.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('CommitteesEvents', 'CentersEvents')
content = content.replace('useFirestoreCollection<EventItem>("events", [])', 'useFirestoreCollection<EventItem>("centers_events", [])')
content = content.replace('addDoc(collection(db, "events"),', 'addDoc(collection(db, "centers_events"),')
with open('src/pages/CentersEvents.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Patch CentersTasks.tsx
with open('src/pages/CentersTasks.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('CommitteesTasks', 'CentersTasks')
content = content.replace('collection(db, "tasks")', 'collection(db, "centers_tasks")')
content = content.replace('useFirestoreCollection<any>("tasks", [])', 'useFirestoreCollection<any>("centers_tasks", [])')
with open('src/pages/CentersTasks.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Patch AffiliatesEvents.tsx
with open('src/pages/AffiliatesEvents.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('CommitteesEvents', 'AffiliatesEvents')
content = content.replace('useFirestoreCollection<EventItem>("events", [])', 'useFirestoreCollection<EventItem>("affiliates_events", [])')
content = content.replace('addDoc(collection(db, "events"),', 'addDoc(collection(db, "affiliates_events"),')
with open('src/pages/AffiliatesEvents.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Patch AffiliatesTasks.tsx
with open('src/pages/AffiliatesTasks.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('CommitteesTasks', 'AffiliatesTasks')
content = content.replace('collection(db, "tasks")', 'collection(db, "affiliates_tasks")')
content = content.replace('useFirestoreCollection<any>("tasks", [])', 'useFirestoreCollection<any>("affiliates_tasks", [])')
with open('src/pages/AffiliatesTasks.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
