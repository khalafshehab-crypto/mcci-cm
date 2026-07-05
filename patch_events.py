import re
import os

files_to_edit = [
    'src/pages/CentersEvents.tsx',
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/AssistantSecGenEvents.tsx'
]

def find_block_end(text, start_idx):
    stack = 0
    in_string = False
    string_char = ''
    
    for i in range(start_idx, len(text)):
        char = text[i]
        
        if in_string:
            if char == string_char and text[i-1] != '\\':
                in_string = False
            continue
            
        if char in '"\'`':
            in_string = True
            string_char = char
            continue
            
        if char == '(':
            stack += 1
        elif char == ')':
            stack -= 1
            if stack == 0:
                return i
                
    return -1

for file_path in files_to_edit:
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add fields to EventItem if not already present
    if "meetingStatus?:" not in content:
        content = re.sub(
            r'(notes: string;)',
            r'\1\n  meetingStatus?: string;\n  postponeDate?: string;\n  cancelReason?: string;',
            content
        )

    # find collectionName dynamically based on the file
    collection_name = ""
    if "CentersEvents.tsx" in file_path:
        collection_name = "centers_events"
    elif "AffiliatesEvents.tsx" in file_path:
        collection_name = "affiliates_events"
    elif "AssistantSecGenEvents.tsx" in file_path:
        collection_name = "assistant_sec_gen_events"

    # We need to replace the `isExpanded && (` block
    match = re.search(r'\{isExpanded && \(', content)
    if match:
        start_idx = match.end() - 1
        end_idx = find_block_end(content, start_idx)
        
        if end_idx != -1:
            # Replace the block
            replacement = f"""{{isExpanded && (
                        <tr>
                          <td colSpan={{8}} className="p-0 bg-slate-50 border-t border-b border-gray-200 text-right font-sans">
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: "auto" }} 
                              exit={{ opacity: 0, height: 0 }}
                              className="px-6 py-5 bg-gradient-to-r from-slate-50 to-gray-50 border-y border-gray-200 text-right font-sans"
                            >
                              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-brand" />
                                  تأكيد حالة الاجتماع
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-700">حالة الاجتماع</label>
                                    <select
                                      value={{evt.meetingStatus || ""}}
                                      onChange={{async (e) => {{
                                        const val = e.target.value;
                                        const docRef = doc(db, "{collection_name}", String(evt.id));
                                        await updateDoc(docRef, {{ meetingStatus: val }});
                                      }}}}
                                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand"
                                    >
                                      <option value="">-- تحديد الحالة --</option>
                                      <option value="محجوز">محجوز</option>
                                      <option value="مؤكد">مؤكد</option>
                                      <option value="مؤجل ويطلب موعد بديل">مؤجل ويطلب موعد بديل</option>
                                      <option value="ملغي ويطلب سبب الإلغاء">ملغي ويطلب سبب الإلغاء</option>
                                    </select>
                                  </div>

                                  {{evt.meetingStatus === "مؤجل ويطلب موعد بديل" && (
                                    <div className="space-y-2">
                                      <label className="text-xs font-black text-gray-700">الموعد البديل المقترح</label>
                                      <input
                                        type="date"
                                        value={{evt.postponeDate || ""}}
                                        onChange={{async (e) => {{
                                          const docRef = doc(db, "{collection_name}", String(evt.id));
                                          await updateDoc(docRef, {{ postponeDate: e.target.value }});
                                        }}}}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand"
                                      />
                                    </div>
                                  )}}

                                  {{evt.meetingStatus === "ملغي ويطلب سبب الإلغاء" && (
                                    <div className="space-y-2">
                                      <label className="text-xs font-black text-gray-700">سبب الإلغاء</label>
                                      <input
                                        type="text"
                                        placeholder="اكتب سبب الإلغاء..."
                                        value={{evt.cancelReason || ""}}
                                        onChange={{async (e) => {{
                                          const docRef = doc(db, "{collection_name}", String(evt.id));
                                          await updateDoc(docRef, {{ cancelReason: e.target.value }});
                                        }}}}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand"
                                      />
                                    </div>
                                  )}}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )"""
            content = content[:match.start()] + replacement + content[end_idx+1:]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Patched isExpanded logic in {file_path}")
        else:
            print(f"Could not find end of isExpanded block in {file_path}")
    else:
        print(f"Could not find isExpanded block in {file_path}")

