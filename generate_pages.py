import re

with open('src/pages/CommitteesEvents.tsx', 'r') as f:
    template = f.read()

# For Affiliates Events
affiliates = template
affiliates = affiliates.replace('CommitteesEvents', 'AffiliatesEvents')
affiliates = affiliates.replace('"events"', '"affiliates_events"')
affiliates = affiliates.replace('فعاليات اللجان', 'فعاليات المنتسبين')
affiliates = affiliates.replace('إدارة اللجان', 'إدارة المنتسبين')
affiliates = affiliates.replace('اللجان المحددة', 'القطاع المحدد')
affiliates = affiliates.replace('لوحة اللجان', 'لوحة المنتسبين')
# Employee filter for Affiliates:
affiliates = re.sub(r'e\.orgLevel[123]\.match\(/اللجان/\)', r'e.orgLevel1.match(/المنتسبين/) || (e.orgLevel2 && e.orgLevel2.match(/المنتسبين/)) || (e.orgLevel3 && e.orgLevel3.match(/المنتسبين/))', affiliates)

with open('src/pages/AffiliatesEvents.tsx', 'w') as f:
    f.write(affiliates)

# For Centers Events
centers = template
centers = centers.replace('CommitteesEvents', 'CentersEvents')
centers = centers.replace('"events"', '"centers_events"')
centers = centers.replace('فعاليات اللجان', 'فعاليات المراكز')
centers = centers.replace('إدارة اللجان', 'إدارة المراكز')
centers = centers.replace('لوحة اللجان', 'لوحة المراكز')
# Employee filter for Centers:
centers = re.sub(r'e\.orgLevel[123]\.match\(/اللجان/\)', r'e.orgLevel1.match(/المراكز/) || (e.orgLevel2 && e.orgLevel2.match(/المراكز/)) || (e.orgLevel3 && e.orgLevel3.match(/المراكز/))', centers)

with open('src/pages/CentersEvents.tsx', 'w') as f:
    f.write(centers)

# For Assistant Sec Gen Events
assistant = template
assistant = assistant.replace('CommitteesEvents', 'AssistantSecGenEvents')
assistant = assistant.replace('"events"', '"assistant_sec_gen_events"')
assistant = assistant.replace('فعاليات اللجان', 'فعاليات مساعد الأمين العام')
assistant = assistant.replace('إدارة اللجان', 'مساعد الأمين العام')
assistant = assistant.replace('لوحة اللجان', 'مساعد الأمين العام')
# Employee filter for Assistant Sec Gen:
# The user said: "وصفحة مساعد الأمين العام فقط لسكرتير مساعد الأمين العام"
# Let's match "سكرتير" or "مساعد الأمين"
assistant = re.sub(r'\(e\.orgLevel1 && e\.orgLevel1\.match\(/اللجان/\)\) \|\| \(e\.orgLevel2 && e\.orgLevel2\.match\(/اللجان/\)\) \|\| \(e\.orgLevel3 && e\.orgLevel3\.match\(/اللجان/\)\)', 
                   r'((e.orgLevel1 && e.orgLevel1.match(/مساعد الأمين/)) || (e.orgLevel2 && e.orgLevel2.match(/مساعد الأمين/)) || (e.title && e.title.match(/سكرتير/)))', assistant)

with open('src/pages/AssistantSecGenEvents.tsx', 'w') as f:
    f.write(assistant)

print("Generated pages successfully.")
