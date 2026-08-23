import re

file_path = 'src/pages/Committees.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace <div key="filter-popover..."> wrappers in breadcrumbs with <React.Fragment>

pattern1 = r'<div key="filter-popover-[0-9]+-1">\s*(<span className="text-gray-400 font-bold font-mono">/</span>\s*<button[\s\S]*?</span>\s*</button>)\s*</div>'
replacement1 = r'<React.Fragment>\n                  \1\n                </React.Fragment>'

if re.search(pattern1, content):
    content = re.sub(pattern1, replacement1, content)
    print(f"Fixed breadcrumb 1 in {file_path}")
else:
    print(f"Could not find breadcrumb 1 in {file_path}")


with open(file_path, 'w') as f:
    f.write(content)

