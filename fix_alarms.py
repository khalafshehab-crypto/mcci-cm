import re

with open('src/pages/CommitteesEvents.tsx', 'r') as f:
    content = f.read()

# Replace `isUrgent: true,` with `isUrgent: !!rec.isUrgent,`
new_content = content.replace("isUrgent: true,\n      committee: evt.committeeName,", "isUrgent: !!rec.isUrgent,\n      committee: evt.committeeName,")

with open('src/pages/CommitteesEvents.tsx', 'w') as f:
    f.write(new_content)

print("Fixed alarms export!")
