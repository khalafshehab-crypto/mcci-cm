import re
import os

files = [
    'src/pages/CentersEvents.tsx',
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/AssistantSecGenEvents.tsx'
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        old_options = """                                      <option value="ملغي ويطلب سبب الإلغاء">ملغي ويطلب سبب الإلغاء</option>
                                    </select>"""
        
        new_options = """                                      <option value="ملغي ويطلب سبب الإلغاء">ملغي ويطلب سبب الإلغاء</option>
                                      <option value="تم عقد الاجتماع">تم عقد الاجتماع</option>
                                    </select>"""
                                    
        content = content.replace(old_options, new_options)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched dropdown in {file_path}")
