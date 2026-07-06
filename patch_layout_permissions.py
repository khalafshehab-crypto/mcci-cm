import re

with open('src/components/Layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the arrays directly
content = content.replace(
    '"/", "/committees", "/members", "/events", "/recommendations", "/tasks", "/reports", "/library", \n      "/assistant-sec-gen", "/assistant-sec-gen/events", "/assistant-sec-gen/tasks", \n      "/centers", "/centers/events", "/centers/tasks", \n      "/affiliates", "/affiliates/events", "/affiliates/tasks"',
    '"/", "/committees", "/members", "/events", "/recommendations", "/tasks", "/reports", "/library", \n      "/assistant-sec-gen", \n      "/centers", \n      "/affiliates"'
)

content = content.replace(
    'allowedPaths = ["/assistant-sec-gen", "/assistant-sec-gen/events", "/assistant-sec-gen/tasks"];',
    'allowedPaths = ["/assistant-sec-gen"];'
)

content = content.replace(
    'allowedPaths = ["/centers", "/centers/events", "/centers/tasks"];',
    'allowedPaths = ["/centers"];'
)

content = content.replace(
    'allowedPaths = ["/affiliates", "/affiliates/events", "/affiliates/tasks"];',
    'allowedPaths = ["/affiliates"];'
)

with open('src/components/Layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
