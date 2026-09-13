import re

with open('src/pages/CommitteesEvents.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure newEvent correctly pulls in singleAdditionalInvitees
content = content.replace('employees: [singleEmployee, ...singleAdditionalInvitees].filter(Boolean),', 'employees: [singleEmployee, ...singleAdditionalInvitees].filter(Boolean),')

with open('src/pages/CommitteesEvents.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
