import re

files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx']

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Replace <div key="filter-popover..."> wrappers in breadcrumbs with <React.Fragment>

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

    pattern3 = r'<div key="filter-popover-[0-9]+-3">\s*(<span className="text-gray-400 font-bold font-mono">/</span>\s*<div className="flex items-center gap-1\.5[\s\S]*?</span>\s*</div>)\s*</div>'
    replacement3 = r'<React.Fragment>\n                  \1\n                </React.Fragment>'

    if re.search(pattern3, content):
        content = re.sub(pattern3, replacement3, content)
        print(f"Fixed breadcrumb 3 in {file_path}")

    with open(file_path, 'w') as f:
        f.write(content)

