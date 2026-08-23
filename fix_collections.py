import re

files = {
    'src/pages/AffiliatesEvents.tsx': ('"committees"', '"affiliates_sectors"'),
    'src/pages/CentersEvents.tsx': ('"committees"', '"centers_list"'),
    'src/pages/AssistantSecGenEvents.tsx': ('"committees"', '"assistant_sec_gen_departments"')
}

for file_path, (old, new) in files.items():
    with open(file_path, 'r') as f:
        content = f.read()
    
    # We only want to replace the useFirestoreCollection("committees") call, not all instances of "committees".
    # Wait, rawCommittees is used everywhere. It's fine to just replace useFirestoreCollection("committees", [])
    
    content = content.replace(f'useFirestoreCollection<any>({old}, [])', f'useFirestoreCollection<any>({new}, [])')
    
    with open(file_path, 'w') as f:
        f.write(content)

print("Collections updated.")
