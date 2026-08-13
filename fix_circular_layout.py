import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

# Replace the entire step 4 circular view
start_marker = r'                    \{workspaceService === "circular" \? \(\n                      <div className="flex-1 bg-gray-200/80 p-4 rounded-xl overflow-y-auto flex justify-center h-\[70vh\]">'
end_marker = r'                    \) : \(\n                    <div className="flex-1 bg-gray-200/80 p-4 sm:p-8 rounded-xl overflow-y-auto flex justify-center h-\[70vh\]">'

match = re.search(f"{start_marker}.*?(?={end_marker})", content, re.DOTALL)

new_layout = '''                    {workspaceService === "circular" ? (
                      <div className="flex-1 bg-gray-200/80 p-4 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
                        <div 
                          ref={circularPrintRef}
                          className="bg-white shadow-2xl border border-gray-200 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mx-auto shrink-0 transition-all p-12 sm:p-16 text-[18px] leading-[2.2] font-sans text-gray-900 relative"
                        >
                           {/* Header */}
                           <div className="grid grid-cols-3 items-center mb-8">
                             {/* Right: Info */}
                             <div className="text-right text-lg text-gray-800 space-y-3 font-bold">
                               <div className="flex items-center justify-start gap-2">
                                  <span>رقم التعميم:</span>
                                  <input type="text" value={circularOutNumber} onChange={e => setCircularOutNumber(e.target.value)} className="bg-transparent border-b border-gray-300 text-gray-900 text-right w-32 focus:outline-none focus:border-gray-500" />
                               </div>
                               <div className="flex items-center justify-start gap-2">
                                  <span>تاريخه:</span>
                                  <input type="text" value={circularOutDate} onChange={e => setCircularOutDate(e.target.value)} className="bg-transparent border-b border-gray-300 text-gray-900 text-right w-32 focus:outline-none focus:border-gray-500" />
                               </div>
                             </div>

                             {/* Center: Title */}
                             <div className="text-center relative">
                               <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-[0.2em] relative z-10 inline-block px-4 bg-white pb-2">تـعـمـيـم</h1>
                               <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-300 -translate-y-1/2 z-0"></div>
                               {circularTypes.length > 0 && (
                                 <div className="mt-2 flex justify-center gap-2 relative z-10">
                                   {circularTypes.map(type => (
                                     <span key={type} className="px-4 py-1 border border-gray-800 text-gray-900 rounded-full text-sm font-bold bg-white">
                                       {type}
                                     </span>
                                   ))}
                                 </div>
                               )}
                             </div>

                             {/* Left: Logo area */}
                             <div className="flex justify-end">
                               <div className="w-28 h-28 border border-gray-900 flex items-center justify-center p-2">
                                 <div className="text-center font-bold text-gray-900 leading-tight">
                                   شعار<br/>غرفة<br/>مكة
                                 </div>
                               </div>
                             </div>
                           </div>

                           {/* Meta Info Box */}
                           <div className="border border-gray-900 p-3 rounded mb-10 flex flex-wrap justify-center items-center gap-2 text-xl font-bold bg-transparent">
                             <span>وارد من:</span>
                             <span className="text-gray-900">{circularIncomingFrom || "—"}</span>
                             <span className="mx-2">برقم:</span>
                             <span className="text-gray-900">{circularNumberDate ? circularNumberDate.split(" ")[0] : "—"}</span>
                             <span className="mx-2">وتاريخ:</span>
                             <span className="text-gray-900">{circularNumberDate ? circularNumberDate.split(" ").slice(1).join(" ") : "—"}</span>
                           </div>
                           
                           {/* Subject */}
                           <div className="text-center text-3xl font-bold text-gray-900 mb-8 leading-relaxed px-4 underline underline-offset-8 decoration-gray-400">
                             {circularSubject || "—"}
                           </div>

                           {/* Body */}
                           <div className="flex-1 flex flex-col mb-12">
                             <textarea 
                               value={aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText.split("نص توجيهي مقترح لإرساله للجان:")[1]?.trim() || aiGenGeneratedText} 
                               onChange={e => setAiGenGeneratedText("عرض التعميم:\\n" + e.target.value)}
                               className="flex-1 w-full bg-transparent text-gray-900 text-justify text-[20px] leading-[2.2] focus:outline-none resize-none min-h-[200px]"
                             />
                           </div>
                           
                           {/* Footer Horizontal Line */}
                           <div className="w-full h-[2px] bg-gray-400 mb-8"></div>
                           
                           {/* Footer (Contact & Attachments) */}
                           <div className="flex items-start justify-between">
                             {/* Right (Attachments in RTL) */}
                             <div className="flex items-start gap-2" data-html2canvas-ignore="true">
                               <span className="font-bold text-xl text-gray-900 mt-2">
                                 المرفقات:
                               </span>
                               <div className="flex flex-col gap-2">
                                 {(circularMainFile || circularAtt1 || circularAtt2 || circularAtt3) ? (
                                   <>
                                     {circularMainFile && typeof circularMainFile === 'string' && circularMainFile !== "#" && (
                                       <a href={circularMainFile} target="_blank" rel="noopener noreferrer" className="border border-gray-900 px-4 py-2 rounded text-blue-700 font-bold hover:underline inline-block">
                                         خطاب اتحاد الغرف
                                       </a>
                                     )}
                                     {circularAtt1 && typeof circularAtt1 === 'string' && circularAtt1 !== "#" && (
                                       <a href={circularAtt1} target="_blank" rel="noopener noreferrer" className="border border-gray-900 px-4 py-2 rounded text-blue-700 font-bold hover:underline inline-block mt-2">
                                         مرفق 1
                                       </a>
                                     )}
                                     {circularAtt2 && typeof circularAtt2 === 'string' && circularAtt2 !== "#" && (
                                       <a href={circularAtt2} target="_blank" rel="noopener noreferrer" className="border border-gray-900 px-4 py-2 rounded text-blue-700 font-bold hover:underline inline-block mt-2">
                                         مرفق 2
                                       </a>
                                     )}
                                     {circularAtt3 && typeof circularAtt3 === 'string' && circularAtt3 !== "#" && (
                                       <a href={circularAtt3} target="_blank" rel="noopener noreferrer" className="border border-gray-900 px-4 py-2 rounded text-blue-700 font-bold hover:underline inline-block mt-2">
                                         مرفق 3
                                       </a>
                                     )}
                                   </>
                                 ) : (
                                   <div className="border border-gray-900 px-4 py-2 rounded text-gray-700 font-bold inline-block">
                                     لا توجد مرفقات
                                   </div>
                                 )}
                               </div>
                             </div>

                             {/* Left (Contact in RTL) */}
                             <div className="space-y-4 text-left mr-auto">
                               <div className="text-2xl font-bold text-gray-900">
                                 الأستاذ / {employees.find(e => e.id === aiGenContact)?.name || "محمد الصيعري"}
                               </div>
                               <div className="flex items-center justify-end gap-3">
                                  <span className="font-bold text-gray-800 text-lg">للتواصل:</span>
                                  <div className="border border-gray-900 px-4 py-1.5 rounded font-bold text-gray-900 text-lg">جوال</div>
                                  <div className="border border-gray-900 px-4 py-1.5 rounded font-bold text-gray-900 text-lg">بريد إلكتروني</div>
                               </div>
                             </div>
                           </div>
                        </div>
                      </div>
'''

if match:
    content = content[:match.start()] + new_layout + content[match.end():]
    with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Match not found")

