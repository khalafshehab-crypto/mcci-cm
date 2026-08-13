import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_header = '''                           <div className="flex items-start justify-between mb-10">
                             {/* Logo area */}
                             <div className="w-32 h-32 border-2 border-gray-400 flex items-center justify-center p-2 rounded-lg">
                               <div className="text-center font-bold text-gray-500 leading-tight">
                                 شعار<br/>غرفة<br/>مكة
                               </div>
                             </div>
                             {/* Auto Info */}
                             <div className="text-right text-base text-gray-800 space-y-3 font-bold mt-2">
                               <div className="flex items-center justify-end gap-2">
                                  <span>رقم التعميم:</span>
                                  <input type="text" value={circularOutNumber} onChange={e => setCircularOutNumber(e.target.value)} className="bg-transparent border-b border-gray-300 text-gray-900 text-center w-28 focus:outline-none focus:border-gray-500" />
                               </div>
                               <div className="flex items-center justify-end gap-2">
                                  <span>تاريخه:</span>
                                  <input type="text" value={circularOutDate} onChange={e => setCircularOutDate(e.target.value)} className="bg-transparent border-b border-gray-300 text-gray-900 text-center w-28 focus:outline-none focus:border-gray-500" />
                               </div>
                             </div>
                           </div>'''

new_header = '''                           <div className="flex items-start justify-between mb-10">
                             {/* Auto Info (Right in RTL) */}
                             <div className="text-right text-lg text-gray-800 space-y-3 font-bold mt-2">
                               <div className="flex items-center justify-start gap-2">
                                  <span>رقم التعميم:</span>
                                  <input type="text" value={circularOutNumber} onChange={e => setCircularOutNumber(e.target.value)} className="bg-transparent border-b border-gray-300 text-gray-900 text-right w-32 focus:outline-none focus:border-gray-500" />
                               </div>
                               <div className="flex items-center justify-start gap-2">
                                  <span>تاريخه:</span>
                                  <input type="text" value={circularOutDate} onChange={e => setCircularOutDate(e.target.value)} className="bg-transparent border-b border-gray-300 text-gray-900 text-right w-32 focus:outline-none focus:border-gray-500" />
                               </div>
                             </div>
                             {/* Logo area (Left in RTL) */}
                             <div className="w-28 h-28 border border-gray-900 flex items-center justify-center p-2">
                               <div className="text-center font-bold text-gray-900 leading-tight">
                                 شعار<br/>غرفة<br/>مكة
                               </div>
                             </div>
                           </div>'''

content = content.replace(old_header, new_header)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)

