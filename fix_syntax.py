import re
import os

files = [
    'src/pages/CentersEvents.tsx',
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/AssistantSecGenEvents.tsx'
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = content.replace(r'getStatusColor\(evt\.meetingStatus \|\| evt\.status\)', r'getStatusColor(evt.meetingStatus || evt.status)')
        content = content.replace(r'\{evt\.meetingStatus \|\| evt\.status\}', r'{evt.meetingStatus || evt.status}')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

