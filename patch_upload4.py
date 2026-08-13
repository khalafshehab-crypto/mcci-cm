import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

content = content.replace('import {  Paperclip', 'import {\n  Paperclip')

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
