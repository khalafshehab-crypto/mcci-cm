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

    # Change: return sourceList.length > 0 ? sourceList.map(e => e.name).filter(Boolean) : EMPLOYEES;
    # To: return sourceList.map(e => e.name).filter(Boolean);
    content = content.replace(
        'return sourceList.length > 0 ? sourceList.map(e => e.name).filter(Boolean) : EMPLOYEES;',
        'return sourceList.map(e => e.name).filter(Boolean);'
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed dynamicEmployees fallback")
