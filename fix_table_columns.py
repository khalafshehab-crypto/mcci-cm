import re

files = ['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx']

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Update the table header
    header_pattern = r'(<th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center w-40">تاريخ التوصية</th>)\s*(<th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center w-36">الحالة</th>)'
    header_replacement = r'\1\n                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center w-36">مسار الاعتماد</th>\n                  \2'
    
    if re.search(header_pattern, content):
        content = re.sub(header_pattern, header_replacement, content)
        print(f"Updated header in {file_path}")
    else:
        print(f"Could not find header in {file_path}")

    # 2. Update the table body row
    row_pattern = r'(<td className="whitespace-nowrap px-4 py-3\.5 whitespace-nowrap text-center text-gray-700 font-bold">\s*\{evt\.date \|\| "غير محدد"\}\s*</td>)\s*(\{/\* الحالة \*/\})'
    row_replacement = r"""\1
                        
                        {/* مسار الاعتماد */}
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-center text-gray-700 font-bold">
                          {(() => {
                            const stage = evt.approvalStage || "أخصائي";
                            let stageColor = "bg-gray-100 text-gray-700 border-gray-200";
                            if (stage === "رئيس قسم") stageColor = "bg-blue-50 text-blue-700 border-blue-200";
                            else if (stage === "مدير إدارة") stageColor = "bg-amber-50 text-amber-700 border-amber-200";
                            else if (stage === "مكتملة") stageColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                            return (
                              <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-black border ${stageColor}`}>
                                {stage}
                              </span>
                            );
                          })()}
                        </td>

                        \2"""
    
    if re.search(row_pattern, content):
        content = re.sub(row_pattern, row_replacement, content)
        print(f"Updated row in {file_path}")
    else:
        print(f"Could not find row in {file_path}")
        
    # 3. Update the colSpan of the expanded row to be 8 instead of 7
    colspan_pattern = r'<td colSpan=\{7\} className="p-0 bg-slate-50 border-t border-b border-gray-200 text-right font-sans">'
    colspan_replacement = r'<td colSpan={8} className="p-0 bg-slate-50 border-t border-b border-gray-200 text-right font-sans">'
    
    if re.search(colspan_pattern, content):
        content = re.sub(colspan_pattern, colspan_replacement, content)
        print(f"Updated colSpan in {file_path}")
    else:
        print(f"Could not find colSpan in {file_path}")

    with open(file_path, 'w') as f:
        f.write(content)

