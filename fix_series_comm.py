import os
import re

files_to_edit = [
    'AssistantSecGenEvents.tsx',
    'CentersEvents.tsx',
    'AffiliatesEvents.tsx'
]

for filename in files_to_edit:
    path = os.path.join('src/pages', filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    series_committee_regex = r'<div className="space-y-1">\s*<label className="text-\[11px\] font-black text-gray-500 block">اللجنة \*?</label>\s*<select\s*value=\{newCommitteeId\}[\s\S]*?</select>\s*</div>'
    content = re.sub(series_committee_regex, '', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done part 6")
