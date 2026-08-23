import re

with open('src/pages/CommitteesEvents.tsx', 'r') as f:
    template = f.read()

# ----------------- Affiliates -----------------
aff = template

# First, fix the employee filter
aff = re.sub(
    r'\(e\.orgLevel1 && e\.orgLevel1\.match\(/اللجان/\)\) \|\| \(e\.orgLevel2 && e\.orgLevel2\.match\(/اللجان/\)\) \|\| \(e\.orgLevel3 && e\.orgLevel3\.match\(/اللجان/\)\)',
    r'(e.orgLevel1 && e.orgLevel1.match(/المنتسبين/)) || (e.orgLevel2 && e.orgLevel2.match(/المنتسبين/)) || (e.orgLevel3 && e.orgLevel3.match(/المنتسبين/))',
    aff
)

# Replace titles
aff = aff.replace('CommitteesEvents', 'AffiliatesEvents')
aff = aff.replace('"events"', '"affiliates_events"')
aff = aff.replace('فعاليات اللجان', 'فعاليات المنتسبين')
aff = aff.replace('إدارة اللجان', 'إدارة المنتسبين')
aff = aff.replace('لوحة اللجان', 'لوحة المنتسبين')

# Replace UI strings
aff = aff.replace('اللجنة المحددة', 'القطاع المحدد')
aff = aff.replace('اختر اللجنة', 'اختر القطاع')
aff = aff.replace('اللجنة *', 'القطاع *')
aff = aff.replace('رئيس اللجنة', 'رئيس القطاع')
aff = aff.replace('أخصائي اللجنة', 'أخصائي القطاع')
aff = aff.replace('تأسيس اللجنة', 'تأسيس القطاع')
aff = aff.replace('وصف اللجنة', 'وصف القطاع')
aff = aff.replace('اسم اللجنة', 'اسم القطاع')
aff = aff.replace('بيانات اللجنة', 'بيانات القطاع')

with open('src/pages/AffiliatesEvents.tsx', 'w') as f:
    f.write(aff)


# ----------------- Centers -----------------
cen = template

# Employee filter
cen = re.sub(
    r'\(e\.orgLevel1 && e\.orgLevel1\.match\(/اللجان/\)\) \|\| \(e\.orgLevel2 && e\.orgLevel2\.match\(/اللجان/\)\) \|\| \(e\.orgLevel3 && e\.orgLevel3\.match\(/اللجان/\)\)',
    r'(e.orgLevel1 && e.orgLevel1.match(/المراكز/)) || (e.orgLevel2 && e.orgLevel2.match(/المراكز/)) || (e.orgLevel3 && e.orgLevel3.match(/المراكز/))',
    cen
)

# Replace titles
cen = cen.replace('CommitteesEvents', 'CentersEvents')
cen = cen.replace('"events"', '"centers_events"')
cen = cen.replace('فعاليات اللجان', 'فعاليات المراكز')
cen = cen.replace('إدارة اللجان', 'إدارة المراكز')
cen = cen.replace('لوحة اللجان', 'لوحة المراكز')

# Replace UI strings
cen = cen.replace('اللجنة المحددة', 'المركز المحدد')
cen = cen.replace('اختر اللجنة', 'اختر المركز')
cen = cen.replace('اللجنة *', 'المركز *')
cen = cen.replace('رئيس اللجنة', 'رئيس المركز')
cen = cen.replace('أخصائي اللجنة', 'أخصائي المركز')
cen = cen.replace('تأسيس اللجنة', 'تأسيس المركز')
cen = cen.replace('وصف اللجنة', 'وصف المركز')
cen = cen.replace('اسم اللجنة', 'اسم المركز')
cen = cen.replace('بيانات اللجنة', 'بيانات المركز')

with open('src/pages/CentersEvents.tsx', 'w') as f:
    f.write(cen)


# ----------------- Assistant Sec Gen -----------------
ast = template

# Employee filter
ast = re.sub(
    r'\(e\.orgLevel1 && e\.orgLevel1\.match\(/اللجان/\)\) \|\| \(e\.orgLevel2 && e\.orgLevel2\.match\(/اللجان/\)\) \|\| \(e\.orgLevel3 && e\.orgLevel3\.match\(/اللجان/\)\)',
    r'(e.orgLevel1 && e.orgLevel1.match(/مساعد الأمين/)) || (e.orgLevel2 && e.orgLevel2.match(/مساعد الأمين/)) || (e.title && e.title.match(/سكرتير/))',
    ast
)

# Replace titles
ast = ast.replace('CommitteesEvents', 'AssistantSecGenEvents')
ast = ast.replace('"events"', '"assistant_sec_gen_events"')
ast = ast.replace('فعاليات اللجان', 'فعاليات مساعد الأمين العام')
ast = ast.replace('إدارة اللجان', 'مساعد الأمين العام')
ast = ast.replace('لوحة اللجان', 'مساعد الأمين العام')

# Replace UI strings
ast = ast.replace('اللجنة المحددة', 'الإدارة المحددة')
ast = ast.replace('اختر اللجنة', 'اختر الإدارة')
ast = ast.replace('اللجنة *', 'الإدارة *')
ast = ast.replace('رئيس اللجنة', 'المسؤول')
ast = ast.replace('أخصائي اللجنة', 'السكرتير')

with open('src/pages/AssistantSecGenEvents.tsx', 'w') as f:
    f.write(ast)

print("Pages updated successfully.")

