import re

with open('src/components/Layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hasSubPages = true with length check
content = content.replace("const hasSubPages = true; // Always show accordion", "const hasSubPages = deptPages.length > 1;")

# Update the departments array:
dept_assistant = """    {
      id: "assistant-sec-gen",
      nameAr: "مساعد الأمين العام",
      icon: <UserCheck className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "شاشة المتابعة", path: "/assistant-sec-gen", icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: "Events", nameAr: "الفعاليات", path: "/assistant-sec-gen/events", icon: <Calendar className="w-4 h-4" /> },
        { name: "Tasks", nameAr: "المهام الإدارية", path: "/assistant-sec-gen/tasks", icon: <CheckSquare className="w-4 h-4" /> }
      ]
    },"""
new_dept_assistant = """    {
      id: "assistant-sec-gen",
      nameAr: "مساعد الأمين العام",
      icon: <UserCheck className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "شاشة المتابعة", path: "/assistant-sec-gen", icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },"""
content = content.replace(dept_assistant, new_dept_assistant)

dept_centers = """    {
      id: "centers",
      nameAr: "إدارة المراكز",
      icon: <Building2 className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "شاشة المتابعة", path: "/centers", icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: "Events", nameAr: "الفعاليات", path: "/centers/events", icon: <Calendar className="w-4 h-4" /> },
        { name: "Tasks", nameAr: "المهام الإدارية", path: "/centers/tasks", icon: <CheckSquare className="w-4 h-4" /> }
      ]
    },"""
new_dept_centers = """    {
      id: "centers",
      nameAr: "إدارة المراكز",
      icon: <Building2 className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "شاشة المتابعة", path: "/centers", icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },"""
content = content.replace(dept_centers, new_dept_centers)

dept_affiliates = """    {
      id: "affiliates",
      nameAr: "إدارة المنتسبين",
      icon: <Users className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "شاشة المتابعة", path: "/affiliates", icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: "Events", nameAr: "الفعاليات", path: "/affiliates/events", icon: <Calendar className="w-4 h-4" /> },
        { name: "Tasks", nameAr: "المهام الإدارية", path: "/affiliates/tasks", icon: <CheckSquare className="w-4 h-4" /> }
      ]
    },"""
new_dept_affiliates = """    {
      id: "affiliates",
      nameAr: "إدارة المنتسبين",
      icon: <Users className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "شاشة المتابعة", path: "/affiliates", icon: <LayoutDashboard className="w-4 h-4" /> }
      ]
    },"""
content = content.replace(dept_affiliates, new_dept_affiliates)

# For Mobile sidebar
content = content.replace("const hasSubPagesMobile = true; // Always show accordion", "const hasSubPagesMobile = deptPages.length > 1;")


with open('src/components/Layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
