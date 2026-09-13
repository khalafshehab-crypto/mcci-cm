import re

for filename in ['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the broken ternary sequence
    broken = r'''        </div>
      ) : null}

      ) : viewMode === "table" ? ('''
    
    fixed = r'''        </div>
      ) : viewMode === "table" ? ('''
    
    content = content.replace(broken, fixed)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
print("Done fixing JSX")
