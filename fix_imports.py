import re
files = ['src/pages/Events.tsx', 'src/pages/CommitteesEvents.tsx']
for fpath in files:
    with open(fpath, 'r') as f:
        content = f.read()
    
    # Check if Upload is imported
    lucide_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+"lucide-react";', content, re.MULTILINE | re.DOTALL)
    if lucide_match:
        imports = lucide_match.group(1)
        if 'Upload' not in imports:
            new_imports = imports + ', Upload'
            content = content[:lucide_match.start(1)] + new_imports + content[lucide_match.end(1):]
    
    with open(fpath, 'w') as f:
        f.write(content)
