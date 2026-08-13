import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

# Replace committee select logic
# Find the div that contains "اختر اللجنة للربط والأرشفة"
select_html_pattern = r'<div>\s*<label className="block text-sm font-bold text-gray-800 mb-2">اختر اللجنة للربط والأرشفة</label>.*?</div>'
select_html_match = re.search(select_html_pattern, content, re.DOTALL)

if select_html_match:
    new_html = """
                        <div>
                           <label className="block text-sm font-bold text-gray-800 mb-2">اختر اللجان للربط والأرشفة</label>
                           <div className="w-full border border-gray-200 rounded-xl overflow-hidden flex flex-col max-h-48 bg-white">
                             <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                               <input 
                                  type="checkbox"
                                  checked={aiGenCommittees.length > 0 && aiGenCommittees.length === committees.filter(c => {
                                    const stored = localStorage.getItem("current_user");
                                    if (!stored) return true;
                                    const currentUser = JSON.parse(stored);
                                    if (currentUser.role === 'مدير نظام') return true;
                                    if (!currentUser.committees || currentUser.committees.length === 0) return true;
                                    return currentUser.committees.includes(c.id);
                                  }).length}
                                  onChange={(e) => {
                                     const available = committees.filter(c => {
                                      const stored = localStorage.getItem("current_user");
                                      if (!stored) return true;
                                      const currentUser = JSON.parse(stored);
                                      if (currentUser.role === 'مدير نظام') return true;
                                      if (!currentUser.committees || currentUser.committees.length === 0) return true;
                                      return currentUser.committees.includes(c.id);
                                    });
                                     if (e.target.checked) setAiGenCommittees(available.map(c => String(c.id)));
                                     else setAiGenCommittees([]);
                                  }}
                                  className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                               />
                               <span className="text-sm font-bold text-gray-700">تحديد جميع اللجان</span>
                             </div>
                             <div className="overflow-y-auto p-2 space-y-1">
                               {committees.filter(c => {
                                  const stored = localStorage.getItem("current_user");
                                  if (!stored) return true;
                                  const currentUser = JSON.parse(stored);
                                  if (currentUser.role === 'مدير نظام') return true;
                                  if (!currentUser.committees || currentUser.committees.length === 0) return true;
                                  return currentUser.committees.includes(c.id);
                                }).map((c, i) => (
                                 <label key={`${c.id}-${i}`} className="flex items-center gap-3 p-2 hover:bg-emerald-50/50 rounded-lg cursor-pointer transition-colors">
                                    <input 
                                       type="checkbox"
                                       checked={aiGenCommittees.includes(String(c.id))}
                                       onChange={(e) => {
                                         if (e.target.checked) setAiGenCommittees([...aiGenCommittees, String(c.id)]);
                                         else setAiGenCommittees(aiGenCommittees.filter(id => id !== String(c.id)));
                                       }}
                                       className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                                 </label>
                               ))}
                             </div>
                           </div>
                        </div>
                        {workspaceService === "circular" && (
                          <div>
                             <label className="block text-sm font-bold text-gray-800 mb-2">وسيلة إرسال التعميم</label>
                             <div className="flex gap-4 items-center">
                               <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="checkbox" checked={circularViaEmail} onChange={e => setCircularViaEmail(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
                                 <span className="text-sm font-bold text-gray-700">البريد الإلكتروني</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="checkbox" checked={circularViaWhatsApp} onChange={e => setCircularViaWhatsApp(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
                                 <span className="text-sm font-bold text-gray-700">واتس آب</span>
                               </label>
                             </div>
                          </div>
                        )}
"""
    content = content.replace(select_html_match.group(0), new_html.strip())
    with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
        f.write(content)
else:
    print("Match failed")
