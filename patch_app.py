import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove imports
imports_to_remove = [
    r'const AssistantSecGenEvents = React\.lazy\(\(\) => import\("\./pages/AssistantSecGenEvents"\)\);\n',
    r'const AssistantSecGenTasks = React\.lazy\(\(\) => import\("\./pages/AssistantSecGenTasks"\)\);\n',
    r'const CentersEvents = React\.lazy\(\(\) => import\("\./pages/CentersEvents"\)\);\n',
    r'const CentersTasks = React\.lazy\(\(\) => import\("\./pages/CentersTasks"\)\);\n',
    r'const AffiliatesEvents = React\.lazy\(\(\) => import\("\./pages/AffiliatesEvents"\)\);\n',
    r'const AffiliatesTasks = React\.lazy\(\(\) => import\("\./pages/AffiliatesTasks"\)\);\n',
]

for imp in imports_to_remove:
    content = re.sub(imp, '', content)

# Remove Routes
routes_to_remove = [
    r'\s*<Route path="/assistant-sec-gen/events" element={<AssistantSecGenEvents />} />',
    r'\s*<Route path="/assistant-sec-gen/tasks" element={<AssistantSecGenTasks />} />',
    r'\s*<Route path="/centers/events" element={<CentersEvents />} />',
    r'\s*<Route path="/centers/tasks" element={<CentersTasks />} />',
    r'\s*<Route path="/affiliates/events" element={<AffiliatesEvents />} />',
    r'\s*<Route path="/affiliates/tasks" element={<AffiliatesTasks />} />',
]

for route in routes_to_remove:
    content = re.sub(route, '', content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
