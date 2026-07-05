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
            
        content = content.replace('initial={ opacity: 0, height: 0 }', 'initial={{ opacity: 0, height: 0 }}')
        content = content.replace('animate={ opacity: 1, height: "auto" }', 'animate={{ opacity: 1, height: "auto" }}')
        content = content.replace('exit={ opacity: 0, height: 0 }', 'exit={{ opacity: 0, height: 0 }}')
        content = content.replace('colSpan={8}', 'colSpan={8}') # already correct, but just in case
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

