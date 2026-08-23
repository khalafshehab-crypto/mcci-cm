import re

files = [
    'src/pages/CommitteesMembers.tsx',
    'src/pages/Members.tsx'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # The breadcrumbs container for members might look like:
    pattern = r'<div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">'
    replacement = r'<div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4 font-sans">'
    
    if re.search(pattern, content):
        content = re.sub(pattern, replacement, content)
        print(f"Updated container in {file_path}")

    # Also look for any remaining filter-popovers
    pattern1 = r'<div key="filter-popover-[0-9]+-1">\s*(<span className="text-gray-400 font-bold font-mono">/</span>\s*<button[\s\S]*?</span>\s*</button>)\s*</div>'
    replacement1 = r'<React.Fragment>\n                  \1\n                </React.Fragment>'

    if re.search(pattern1, content):
        content = re.sub(pattern1, replacement1, content)
        print(f"Fixed breadcrumb 1 in {file_path}")

    pattern2 = r'<div key="filter-popover-[0-9]+-2">\s*(<span className="text-gray-400 font-bold font-mono">/</span>\s*<button[\s\S]*?</span>\s*</button>)\s*</div>'
    replacement2 = r'<React.Fragment>\n                  \1\n                </React.Fragment>'

    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content)
        print(f"Fixed breadcrumb 2 in {file_path}")

    with open(file_path, 'w') as f:
        f.write(content)

