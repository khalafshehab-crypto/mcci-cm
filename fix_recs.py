import os
import re

files_to_edit = [
    'CommitteesRecommendations.tsx',
    'Recommendations.tsx'
]

for filename in files_to_edit:
    path = os.path.join('src/pages', filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    regex = r'\{newType === "مفردة" && \(\s*<>\s*\{\/\* قبل الفعالية \*\/\}[\s\S]*?\{\/\* بعد الاجتماع \*\/\}[\s\S]*?<\/>\s*\)\}'
    content = re.sub(regex, '', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done part 4")
