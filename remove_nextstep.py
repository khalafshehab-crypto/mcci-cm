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
            
        content = re.sub(r'const nextStep = getCalculatedNextStep\(evt\);\n', '', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned nextStep in {file_path}")

