import os
import re

files_to_edit = [
    'src/pages/CentersEvents.tsx',
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/CommitteesEvents.tsx',
    'src/pages/Events.tsx',
    'src/pages/CommitteesRecommendations.tsx',
    'src/pages/Recommendations.tsx'
]

for path in files_to_edit:
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('|| EMPLOYEES[0] || ""', '|| ""')
    content = content.replace('|| EMPLOYEES[0]', '')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed state initialization")
