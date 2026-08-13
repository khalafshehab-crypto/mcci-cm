import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

content = content.replace('X,', 'X, Upload,') # wait, that won't work
content = content.replace('} from "lucide-react";', 'Upload\n} from "lucide-react";', 1)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
