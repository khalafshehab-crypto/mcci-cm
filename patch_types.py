import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

content = content.replace('useState<File | null>(null);', 'useState<File | string | null>(null);')

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
