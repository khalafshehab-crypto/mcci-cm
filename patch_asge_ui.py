import os
import re

path = 'src/pages/AssistantSecGenEvents.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add to table header (optional, maybe under employees)
# Actually let's just append it to the employees string in the table
# The table cell for employee is: `الموظف: {evt.employees[0] || "غير محدد"}`
table_emp = r'(الموظف: \{evt\.employees\[0\] \|\| "غير محدد"\})'
content = re.sub(table_emp, r'\1{evt.referredFrom ? ` - محالة من: ${evt.referredFrom}` : ""}', content)

# In cards, it might just use the same string
# Let's write the file back
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("UI patched")
