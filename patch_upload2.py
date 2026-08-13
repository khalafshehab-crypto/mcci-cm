import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

content = content.replace('Upload\n} from "lucide-react";', ',Upload\n} from "lucide-react";', 1)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
