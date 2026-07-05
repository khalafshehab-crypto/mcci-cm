import os
import re

files_to_edit = {
    'AssistantSecGenEvents.tsx': 'مساعد الأمين',
    'CentersEvents.tsx': 'مركز|مراكز',
    'AffiliatesEvents.tsx': 'انتساب|الانتساب',
}

for filename, filter_term in files_to_edit.items():
    path = os.path.join('src/pages', filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update dynamicEmployees filtering
    filter_code = f"""
     const sourceList = dbEmployees.filter(e => 
         e && 
         e.role !== "SYS_ADMIN" &&
         e.id !== "01" && 
         e.name !== "شهاب الدين" && 
         e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && 
         e.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com" &&
         ((e.orgLevel1 && e.orgLevel1.match(/{filter_term}/)) || (e.orgLevel2 && e.orgLevel2.match(/{filter_term}/)) || (e.orgLevel3 && e.orgLevel3.match(/{filter_term}/)))
     );
"""
    content = re.sub(r'const sourceList = dbEmployees\.filter\(e =>.*?khalafshehab-crypto@gmail\.com"\s*\);', filter_code.strip(), content, flags=re.DOTALL)

    # 2. Make newCommitteeId optional
    content = content.replace('!newCommitteeId || ', '')

    # 3. Remove "اللجنة" select block for single event
    single_committee_regex = r'<div className="space-y-1">\s*<label className="text-\[11px\] font-black text-gray-500 block">اللجنة</label>\s*<select\s*value=\{newCommitteeId\}[\s\S]*?</select>\s*</div>'
    content = re.sub(single_committee_regex, '', content)

    # 4. Remove "اللجنة" select block for series event (wait, is it same?)
    # actually, the regex above will replace both if it matches. Let's see if there are 2.
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done part 1")
