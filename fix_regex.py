import re

for filename in ['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx']:
    with open(filename, 'r') as f:
        content = f.read()
    
    # Let's find the broken line by searching for `replace(/[`
    new_content = re.sub(r'replace\(\/\[\s*\]\+/g', r'replace(/[\\\\r\\\\n]+/g', content)
    
    # Try a broader regex since there might be a literal newline
    lines = content.split('\n')
    for i in range(len(lines)):
        if "replace(/[" in lines[i]:
            # Just overwrite it entirely
            lines[i] = '                                {evt.description.substring(0, 65).replace(/[\\\\r\\\\n]+/g, " ")}...'
        elif "]+/g," in lines[i]:
            lines[i] = ""
            
    with open(filename, 'w') as f:
        f.write('\n'.join(lines))
    print(f"Fixed {filename}")

