import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

# I will just replace lines 25 to 50 with a clean import block for lucide-react
match = re.search(r'import\s+\{([^}]+)\}\s+from\s+"lucide-react";', content, re.MULTILINE)
if match:
    imports = [x.strip() for x in match.group(1).split(',')]
    imports = list(set([x for x in imports if x]))
    new_import = "import {\n  " + ",\n  ".join(imports) + "\n} from \"lucide-react\";"
    content = content[:match.start()] + new_import + content[match.end():]

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
