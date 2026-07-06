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
            
        old_switch = """      case "ملغي ويطلب سبب الإلغاء": return "text-rose-600 bg-rose-100 ring-rose-200";"""
        new_switch = """      case "ملغي ويطلب سبب الإلغاء": return "text-rose-600 bg-rose-100 ring-rose-200";
      case "تم عقد الاجتماع": return "text-purple-600 bg-purple-100 ring-purple-200";"""
      
        content = content.replace(old_switch, new_switch)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched getStatusColor in {file_path}")
