import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

# Replace the start of aiGenStep === 2
old_step_2_start = '''                    <div className="flex-1 space-y-5">
                      {aiGenMode === "new" ? (
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">'''

new_step_2_start = '''                    <div className="flex-1 space-y-5">
                      {workspaceService === "circular" ? (
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                          <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-emerald-600" />
                            بيانات التعميم
                          </h3>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">التعميم الأساسي (للقراءة وتوليد الرد) *</label>
                            <input
                              type="file"
                              onChange={(e) => setCircularMainFile(e.target.files ? e.target.files[0] : null)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                          <div className="pt-2 border-t border-gray-100">
                             <label className="block text-xs font-bold text-gray-600 mb-1.5">المرفقات (اختياري - حتى 3 مرفقات)</label>
                             <div className="space-y-2">
                               <input type="file" onChange={(e) => setCircularAtt1(e.target.files ? e.target.files[0] : null)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                               <input type="file" onChange={(e) => setCircularAtt2(e.target.files ? e.target.files[0] : null)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                               <input type="file" onChange={(e) => setCircularAtt3(e.target.files ? e.target.files[0] : null)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                             </div>
                          </div>
                        </div>
                      ) : aiGenMode === "new" ? (
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">'''

content = content.replace(old_step_2_start, new_step_2_start)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
