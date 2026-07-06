import re
import os

files_to_edit = [
    'src/pages/CentersEvents.tsx',
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/AssistantSecGenEvents.tsx'
]

for file_path in files_to_edit:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update the select options
        new_options = """<option value="">-- تحديد الحالة --</option>
                                      <option value="محجوز">محجوز</option>
                                      <option value="مؤكد">مؤكد</option>
                                      <option value="مؤجل ويطلب موعد بديل">مؤجل ويطلب موعد بديل</option>
                                      <option value="ملغي ويطلب سبب الإلغاء">ملغي ويطلب سبب الإلغاء</option>
                                      <option value="تم عقد الاجتماع">تم عقد الاجتماع</option>"""
        
        content = re.sub(
            r'<option value="">-- تحديد الحالة --</option>[\s\S]*?<option value="ملغي ويطلب سبب الإلغاء">ملغي ويطلب سبب الإلغاء</option>',
            new_options,
            content
        )

        # Update status color mapping
        status_cases = """      case "تم عقد الاجتماع": return "text-purple-700 bg-purple-50 ring-purple-250";
      case "محجوز": return "text-blue-600 bg-blue-100 ring-blue-200";
      case "مؤكد": return "text-emerald-600 bg-emerald-100 ring-emerald-200";
      case "مؤجل ويطلب موعد بديل": return "text-amber-600 bg-amber-100 ring-amber-200";
      case "ملغي ويطلب سبب الإلغاء": return "text-rose-600 bg-rose-100 ring-rose-200";"""
      
        content = re.sub(
            r'case "محجوز": return "text-blue-600 bg-blue-100 ring-blue-200";[\s\S]*?case "ملغي ويطلب سبب الإلغاء": return "text-rose-600 bg-rose-100 ring-rose-200";',
            status_cases,
            content
        )

        # Update table status logic
        table_logic = """let overallStatusClass = "text-gray-600 bg-gray-50 ring-1 ring-gray-200 border-gray-200";
                            if (displayStatus === "محجوز") overallStatusClass = "text-blue-600 bg-blue-50 ring-1 ring-blue-200 border-blue-200";
                            else if (displayStatus === "مؤكد") overallStatusClass = "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-250 border-emerald-250 font-black";
                            else if (displayStatus === "مؤجل ويطلب موعد بديل") overallStatusClass = "text-amber-700 bg-amber-50 ring-1 ring-amber-250 border-amber-250";
                            else if (displayStatus === "ملغي ويطلب سبب الإلغاء") overallStatusClass = "text-rose-700 bg-rose-50 ring-1 ring-rose-250 border-rose-250";
                            else if (displayStatus === "تم عقد الاجتماع") overallStatusClass = "text-purple-700 bg-purple-50 ring-1 ring-purple-250 border-purple-250 font-black";"""
        
        content = re.sub(
            r'let overallStatusClass = "text-gray-600 bg-gray-50 ring-1 ring-gray-200 border-gray-200";[\s\S]*?else if \(displayStatus === "ملغي ويطلب سبب الإلغاء"\) overallStatusClass = "text-rose-700 bg-rose-50 ring-1 ring-rose-250 border-rose-250";',
            table_logic,
            content
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched statuses in {file_path}")

