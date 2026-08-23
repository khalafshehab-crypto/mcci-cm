import re
with open('src/pages/OrgChart.tsx', 'r') as f:
    content = f.read()

# Replace the opening div with fragment
content = re.sub(r'\{currentUserRole === "SYS_ADMIN" && \(\s*<div key="filter-popover-1784704070986-1">', r'{currentUserRole === "SYS_ADMIN" && (\n          <>', content)

# Replace the closing div with fragment close
content = re.sub(r'</button>\s*</div>\s*\)\}\s*</div>\s*\{/\* 3\. PRESENTATION OF ACTIVE VIEWPORT \*/\}', r'</button>\n          </>\n        )}\n      </div>\n      {/* 3. PRESENTATION OF ACTIVE VIEWPORT */}', content)

with open('src/pages/OrgChart.tsx', 'w') as f:
    f.write(content)
