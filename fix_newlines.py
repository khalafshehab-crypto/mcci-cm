import re

files = [
    'src/pages/CommitteesEvents.tsx',
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/AssistantSecGenEvents.tsx',
    'src/pages/CentersEvents.tsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix the broken string literal
    broken_str = r'"\nالقاعة: "'
    content = re.sub(r'"\nالقاعة: "', r'"\\nالقاعة: "', content)
    content = re.sub(r'"\nملاحظات: "', r'"\\nملاحظات: "', content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")
