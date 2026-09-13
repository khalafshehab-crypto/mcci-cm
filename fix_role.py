import re
import os

files = [
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/AssistantSecGenEvents.tsx',
    'src/pages/CentersEvents.tsx',
    'src/pages/CommitteesEvents.tsx'
]

for filename in files:
    if not os.path.exists(filename): continue
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Look for currentUserRole === "مدير النظام"
    old_role = r'currentUserRole === "مدير النظام"'
    
    # We can replace it with checking the actual role from localStorage if needed, or just true since we just want to avoid empty arrays if they are managers.
    new_role = r'JSON.parse(localStorage.getItem("current_user") || "{}")?.role === "مدير النظام"'
    
    content = content.replace(old_role, new_role)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")
