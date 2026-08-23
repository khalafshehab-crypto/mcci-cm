import re

with open('src/pages/CommitteesEvents.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r'duration: rec\.durationRec \|\| "أسبوعين",\s*attachments: \[\],')
replacement = """duration: rec.durationRec || "أسبوعين",
        attachments: (evt.approvedMinutesUrl && typeof evt.approvedMinutesUrl === 'string') 
          ? [{ id: "1", name: 'محضر الاجتماع المعتمد', url: evt.approvedMinutesUrl }] 
          : [],"""

if pattern.search(content):
    new_content = pattern.sub(replacement, content, count=1)
    with open('src/pages/CommitteesEvents.tsx', 'w') as f:
        f.write(new_content)
    print("Fixed CommitteesEvents.tsx attachments!")
else:
    print("Could not find attachments in CommitteesEvents.tsx!")

