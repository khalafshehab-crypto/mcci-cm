import re

files_to_fix = [
    'src/pages/CommitteesRecommendations.tsx',
    'src/pages/Recommendations.tsx'
]

for filepath in files_to_fix:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to replace the `if (fullUrl.length > 7500) { ... } else { ... }` block
    # with just the content of the `else` block
    
    # Using a robust regex to find the if-else blocks.
    # Note: there might be multiple occurrences in Recommendations.tsx if they exist.
    
    pattern = re.compile(r'if\s*\(fullUrl\.length\s*>\s*7500\)\s*\{[\s\S]*?\}\s*else\s*\{\s*(const a = document\.createElement\(\'a\'\);\s*a\.href = fullUrl;\s*a\.target = \'_blank\';\s*a\.rel = \'noopener noreferrer\';\s*a\.click\(\);)\s*\}')
    
    new_content = pattern.sub(r'\1', content)
    
    with open(filepath, 'w') as f:
        f.write(new_content)
        
    print(f"Fixed {filepath}")

