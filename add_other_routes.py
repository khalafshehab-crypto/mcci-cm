import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
imports = """const Centers = React.lazy(() => import("./pages/Centers"));
const CentersEvents = React.lazy(() => import("./pages/CentersEvents"));
const CentersTasks = React.lazy(() => import("./pages/CentersTasks"));"""
content = re.sub(r'const Centers = React\.lazy\(\(\) => import\("\./pages/Centers"\)\);', imports, content)

imports2 = """const Affiliates = React.lazy(() => import("./pages/Affiliates"));
const AffiliatesEvents = React.lazy(() => import("./pages/AffiliatesEvents"));
const AffiliatesTasks = React.lazy(() => import("./pages/AffiliatesTasks"));"""
content = re.sub(r'const Affiliates = React\.lazy\(\(\) => import\("\./pages/Affiliates"\)\);', imports2, content)

# Add routes
routes = """<Route path="/centers" element={<Centers />} />
              <Route path="/centers/events" element={<CentersEvents />} />
              <Route path="/centers/tasks" element={<CentersTasks />} />"""
content = re.sub(r'<Route path="/centers" element={<Centers />} />', routes, content)

routes2 = """<Route path="/affiliates" element={<Affiliates />} />
              <Route path="/affiliates/events" element={<AffiliatesEvents />} />
              <Route path="/affiliates/tasks" element={<AffiliatesTasks />} />"""
content = re.sub(r'<Route path="/affiliates" element={<Affiliates />} />', routes2, content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/components/Layout.tsx', 'r', encoding='utf-8') as f:
    layout = f.read()

dept1 = """    {
      id: "centers",
      nameAr: "إدارة المراكز",
      icon: <Building2 className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "شاشة المتابعة", path: "/centers", icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: "Events", nameAr: "الفعاليات", path: "/centers/events", icon: <Calendar className="w-4 h-4" /> },
        { name: "Tasks", nameAr: "المهام الإدارية", path: "/centers/tasks", icon: <CheckSquare className="w-4 h-4" /> }
      ]
    },"""
layout = re.sub(r'\{\s*id: "centers",\s*nameAr: "إدارة المراكز",\s*icon: <Building2 className="w-4 h-4" />,\s*pages: \[\s*\{\s*name: "Dashboard", nameAr: "شاشة المتابعة", path: "/centers", icon: <LayoutDashboard className="w-4 h-4" /> \}\s*\]\s*\},', dept1, layout)

dept2 = """    {
      id: "affiliates",
      nameAr: "إدارة المنتسبين",
      icon: <Users className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "شاشة المتابعة", path: "/affiliates", icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: "Events", nameAr: "الفعاليات", path: "/affiliates/events", icon: <Calendar className="w-4 h-4" /> },
        { name: "Tasks", nameAr: "المهام الإدارية", path: "/affiliates/tasks", icon: <CheckSquare className="w-4 h-4" /> }
      ]
    },"""
layout = re.sub(r'\{\s*id: "affiliates",\s*nameAr: "إدارة المنتسبين",\s*icon: <Users className="w-4 h-4" />,\s*pages: \[\s*\{\s*name: "Dashboard", nameAr: "شاشة المتابعة", path: "/affiliates", icon: <LayoutDashboard className="w-4 h-4" /> \}\s*\]\s*\},', dept2, layout)

layout = layout.replace('const CENTERS_PAGES = ["/centers"];', 'const CENTERS_PAGES = ["/centers", "/centers/events", "/centers/tasks"];')
layout = layout.replace('const AFFILIATES_PAGES = ["/affiliates"];', 'const AFFILIATES_PAGES = ["/affiliates", "/affiliates/events", "/affiliates/tasks"];')

layout = layout.replace('"/centers", \n      "/affiliates"', '"/centers", "/centers/events", "/centers/tasks", \n      "/affiliates", "/affiliates/events", "/affiliates/tasks"')

with open('src/components/Layout.tsx', 'w', encoding='utf-8') as f:
    f.write(layout)
