import re

with open('src/pages/CommitteesEvents.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r'hasImpact: !!rec\.hasImpact\s*};')
replacement = """hasImpact: !!rec.hasImpact,
        isUrgent: !!rec.isUrgent,
        isImportant: !!rec.isImportant,
        impactType: rec.impactType || "عادية"
      };"""

if pattern.search(content):
    new_content = pattern.sub(replacement, content)
    with open('src/pages/CommitteesEvents.tsx', 'w') as f:
        f.write(new_content)
    print("Fixed CommitteesEvents.tsx export!")
else:
    print("Could not find pattern in CommitteesEvents.tsx!")

