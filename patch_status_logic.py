import re
import os

files_to_edit = [
    'src/pages/CentersEvents.tsx',
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/AssistantSecGenEvents.tsx'
]

def patch_file(file_path):
    if not os.path.exists(file_path):
        return
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 1. Update getStatusColor
    status_cases = """      case "منتهية": return "text-emerald-600 bg-emerald-100 ring-emerald-200";
      case "محجوز": return "text-blue-600 bg-blue-100 ring-blue-200";
      case "مؤكد": return "text-emerald-600 bg-emerald-100 ring-emerald-200";
      case "مؤجل ويطلب موعد بديل": return "text-amber-600 bg-amber-100 ring-amber-200";
      case "ملغي ويطلب سبب الإلغاء": return "text-rose-600 bg-rose-100 ring-rose-200";"""
    content = re.sub(r'case "منتهية": return "text-emerald-600 bg-emerald-100 ring-emerald-200";', status_cases, content)
    
    # 2. Update isEventCompleted
    is_completed_logic = """  const isEventCompleted = (evt: EventItem): boolean => {
    return evt.meetingStatus === "مؤكد" || evt.meetingStatus === "ملغي ويطلب سبب الإلغاء";
  };"""
    content = re.sub(r'const isEventCompleted = \(evt: EventItem\): boolean => \{[\s\S]*?\};\n', is_completed_logic + '\n', content)
    
    # 3. Update grid view status
    grid_status = r'getStatusColor\(evt\.meetingStatus \|\| evt\.status\)'
    content = re.sub(r'getStatusColor\(evt\.status\)', grid_status, content)
    
    grid_status_text = r'\{evt\.meetingStatus \|\| evt\.status\}'
    content = re.sub(r'\{evt\.status\}', grid_status_text, content)
    
    # 4. Update table view status column
    # We need to find the specific <td className="px-4 py-3.5 whitespace-nowrap text-center"> that contains stepValues
    
    table_col_pattern = r'<td className="px-4 py-3.5 whitespace-nowrap text-center">\s*\{\(\(\) => \{\s*const stepValues = \[[\s\S]*?</div>\s*\);\s*\}\)\(\)\}\s*</td>'
    
    new_table_col = """<td className="px-4 py-3.5 whitespace-nowrap text-center">
                          {(() => {
                            const displayStatus = evt.meetingStatus || "غير محدد";
                            
                            let overallStatusClass = "text-gray-600 bg-gray-50 ring-1 ring-gray-200 border-gray-200";
                            if (displayStatus === "محجوز") overallStatusClass = "text-blue-600 bg-blue-50 ring-1 ring-blue-200 border-blue-200";
                            else if (displayStatus === "مؤكد") overallStatusClass = "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-250 border-emerald-250 font-black";
                            else if (displayStatus === "مؤجل ويطلب موعد بديل") overallStatusClass = "text-amber-700 bg-amber-50 ring-1 ring-amber-250 border-amber-250";
                            else if (displayStatus === "ملغي ويطلب سبب الإلغاء") overallStatusClass = "text-rose-700 bg-rose-50 ring-1 ring-rose-250 border-rose-250";

                            return (
                              <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black ${overallStatusClass}`}>
                                  {displayStatus}
                                </span>
                              </div>
                            );
                          })()}
                        </td>"""
    
    content = re.sub(table_col_pattern, new_table_col, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched logic in {file_path}")

for f in files_to_edit:
    patch_file(f)

