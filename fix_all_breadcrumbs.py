import re

files = [
    'src/pages/CommitteesRecommendations.tsx',
    'src/pages/Recommendations.tsx',
    'src/pages/CommitteesEvents.tsx',
    'src/pages/Events.tsx'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # We want to make sure the breadcrumbs container has:
    # className="... flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans"
    # To fix the layout wrapping issue.
    
    # 1. Match the container in CommitteesRecommendations and Recommendations:
    pattern1 = r'<div className="bg-\[#e8e4e4\] border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4 font-sans">'
    replacement1 = r'<div className="bg-[#e8e4e4] border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4 font-sans">'
    
    # Let's just do a generic replace for any flex-wrap container near breadcrumbs
    
    pattern2 = r'<div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">'
    replacement2 = r'<div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4 font-sans">'
    
    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content)
        print(f"Updated container in {file_path}")

    with open(file_path, 'w') as f:
        f.write(content)

