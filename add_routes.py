import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
imports = """const AssistantSecGen = React.lazy(() => import("./pages/AssistantSecGen"));
const AssistantSecGenEvents = React.lazy(() => import("./pages/AssistantSecGenEvents"));
const AssistantSecGenTasks = React.lazy(() => import("./pages/AssistantSecGenTasks"));"""

content = re.sub(r'const AssistantSecGen = React\.lazy\(\(\) => import\("\./pages/AssistantSecGen"\)\);', imports, content)

# Add routes
routes = """<Route path="/assistant-sec-gen" element={<AssistantSecGen />} />
              <Route path="/assistant-sec-gen/events" element={<AssistantSecGenEvents />} />
              <Route path="/assistant-sec-gen/tasks" element={<AssistantSecGenTasks />} />"""

content = re.sub(r'<Route path="/assistant-sec-gen" element={<AssistantSecGen />} />', routes, content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)


with open('src/components/Layout.tsx', 'r', encoding='utf-8') as f:
    layout = f.read()

dept = """    {
      id: "assistant-sec-gen",
      nameAr: "مساعد الأمين العام",
      icon: <UserCheck className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "شاشة المتابعة", path: "/assistant-sec-gen", icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: "Events", nameAr: "الفعاليات", path: "/assistant-sec-gen/events", icon: <Calendar className="w-4 h-4" /> },
        { name: "Tasks", nameAr: "المهام الإدارية", path: "/assistant-sec-gen/tasks", icon: <CheckSquare className="w-4 h-4" /> }
      ]
    },"""

layout = re.sub(r'\{\s*id: "assistant-sec-gen",\s*nameAr: "مساعد الأمين العام",\s*icon: <UserCheck className="w-4 h-4" />,\s*pages: \[\s*\{\s*name: "Dashboard", nameAr: "شاشة المتابعة", path: "/assistant-sec-gen", icon: <LayoutDashboard className="w-4 h-4" /> \}\s*\]\s*\},', dept, layout)

layout = layout.replace('const ASSISTANT_SEC_GEN_PAGES = ["/assistant-sec-gen"];', 'const ASSISTANT_SEC_GEN_PAGES = ["/assistant-sec-gen", "/assistant-sec-gen/events", "/assistant-sec-gen/tasks"];')
layout = layout.replace('"/assistant-sec-gen", \n      "/centers"', '"/assistant-sec-gen", "/assistant-sec-gen/events", "/assistant-sec-gen/tasks", \n      "/centers"')

with open('src/components/Layout.tsx', 'w', encoding='utf-8') as f:
    f.write(layout)
