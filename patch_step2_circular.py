import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_circular = '''                          <div>
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
                          </div>'''

new_circular = '''                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <AttachmentInput
                              id="circularMain"
                              label="التعميم الأساسي *"
                              value={circularMainFile}
                              onChange={setCircularMainFile}
                            />
                            <AttachmentInput
                              id="circularAtt1"
                              label="مرفق إضافي 1"
                              value={circularAtt1}
                              onChange={setCircularAtt1}
                            />
                            <AttachmentInput
                              id="circularAtt2"
                              label="مرفق إضافي 2"
                              value={circularAtt2}
                              onChange={setCircularAtt2}
                            />
                            <AttachmentInput
                              id="circularAtt3"
                              label="مرفق إضافي 3"
                              value={circularAtt3}
                              onChange={setCircularAtt3}
                            />
                          </div>'''

content = content.replace(old_circular, new_circular)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
