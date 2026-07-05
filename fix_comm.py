import os
import re

path = 'src/pages/CommitteesEvents.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

filter_term = 'اللجان'

filter_code = f"""
     const sourceList = dbEmployees.filter(e => 
         e && 
         e.role !== "SYS_ADMIN" &&
         e.id !== "01" && 
         e.name !== "شهاب الدين" && 
         e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && 
         e.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com" &&
         ((e.orgLevel1 && e.orgLevel1.match(/{filter_term}/)) || (e.orgLevel2 && e.orgLevel2.match(/{filter_term}/)) || (e.orgLevel3 && e.orgLevel3.match(/{filter_term}/)))
     );
"""
content = re.sub(r'const sourceList = dbEmployees\.filter\(e =>.*?khalafshehab-crypto@gmail\.com"\s*\);', filter_code.strip(), content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done part 3")
