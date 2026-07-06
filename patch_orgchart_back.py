import re

with open('src/pages/OrgChart.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const ASSISTANT_SEC_GEN_PAGES = ["/assistant-sec-gen"];',
    'const ASSISTANT_SEC_GEN_PAGES = ["/assistant-sec-gen", "/assistant-sec-gen/events", "/assistant-sec-gen/tasks"];'
)

content = content.replace(
    'const CENTERS_PAGES = ["/centers"];',
    'const CENTERS_PAGES = ["/centers", "/centers/events", "/centers/tasks"];'
)

content = content.replace(
    'const AFFILIATES_PAGES = ["/affiliates"];',
    'const AFFILIATES_PAGES = ["/affiliates", "/affiliates/events", "/affiliates/tasks"];'
)

with open('src/pages/OrgChart.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
