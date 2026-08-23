import re

target_files = ['src/pages/Recommendations.tsx']

for file in target_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # 2. Replace the HTML for numbering in card view
    pattern = r'REC-\{String\(rec\.id \|\| ""\)\.substring\(0, 5\)\.toUpperCase\(\)\}'
    replacement = r'{generateRecommendationRefNumber(rec)}'
    
    new_content = re.sub(pattern, replacement, content)
    
    with open(file, 'w') as f:
        f.write(new_content)
    print(f"Fixed numbering 3 in {file}")

