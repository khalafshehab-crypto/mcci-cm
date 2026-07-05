import re
import os

files_to_edit = [
    'src/pages/CentersEvents.tsx',
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/AssistantSecGenEvents.tsx'
]

for file_path in files_to_edit:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Change the label in grid view dropdown
        content = re.sub(r'<span>تحديث المسار</span>', r'<span>تحديث الحالة</span>', content)
        content = re.sub(r'<span>تحديث مسار الفعالية</span>', r'<span>تحديث الحالة</span>', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched grid view labels in {file_path}")

