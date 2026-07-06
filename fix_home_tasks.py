import re

def patch_file(filename):
    with open(filename, "r") as f:
        content = f.read()

    # Fix the committee for tasks
    content = content.replace('committee: "العامة واللوائح التنظيمية"', 'committee: (t as any).sourceCommittee || "مهام مخصصة"')
    content = content.replace('committee: "الاتصال والتنسيق الفوري"', 'committee: "تنسيق فوري"')

    # Fix the employee display string in referral
    content = content.replace('{staff.name} ({staff.title || staff.role})', '{staff.name} - {staff.jobTitle || staff.title || staff.role || "موظف"}')

    with open(filename, "w") as f:
        f.write(content)

patch_file("src/pages/CommitteesHome.tsx")
