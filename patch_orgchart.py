import re

with open('src/pages/OrgChart.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const ASSISTANT_SEC_GEN_PAGES = ["/assistant-sec-gen", "/assistant-sec-gen/events", "/assistant-sec-gen/tasks"];',
    'const ASSISTANT_SEC_GEN_PAGES = ["/assistant-sec-gen"];'
)

content = content.replace(
    'const CENTERS_PAGES = ["/centers", "/centers/events", "/centers/tasks"];',
    'const CENTERS_PAGES = ["/centers"];'
)

content = content.replace(
    'const AFFILIATES_PAGES = ["/affiliates", "/affiliates/events", "/affiliates/tasks"];',
    'const AFFILIATES_PAGES = ["/affiliates"];'
)

with open('src/pages/OrgChart.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
