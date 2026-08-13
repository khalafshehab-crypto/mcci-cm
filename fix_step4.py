import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

insertion_point = '''                )}
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0 rounded-b-3xl">'''

step4_code = '''                )}
                {aiGenStep === 4 && workspaceService === "circular" && (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        معاينة التعميم النهائي (جاهز للطباعة والتصدير)
                      </h3>
                    </div>
                    
                    <div className="flex-1 bg-gray-200/80 p-4 sm:p-8 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
                        <div 
                          ref={circularPrintRef}
                          className="bg-white shadow-2xl border border-gray-200 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mx-auto shrink-0 transition-all p-12 sm:p-16 text-[18px] leading-[2.2] font-sans text-gray-900 relative"
                        >
                           {/* Header */}
                           <div className="grid grid-cols-3 items-center mb-10">
                             {/* Right: Info */}
                             <div className="text-right text-lg text-gray-800 space-y-3 font-bold">
                               <div className="flex items-center justify-start gap-2">
                                  <span>رقم التعميم:</span>
                                  <input type="text" value={circularOutNumber} onChange={e => setCircularOutNumber(e.target.value)} className="bg-transparent border-b border-gray-400 text-gray-900 text-right w-32 focus:outline-none focus:border-gray-800" />
                               </div>
                               <div className="flex items-center justify-start gap-2">
                                  <span>تاريخه:</span>
                                  <input type="text" value={circularOutDate} onChange={e => setCircularOutDate(e.target.value)} className="bg-transparent border-b border-gray-400 text-gray-900 text-right w-32 focus:outline-none focus:border-gray-800" />
                               </div>
                             </div>

                             {/* Center: Title */}
                             <div className="text-center relative">
                               <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-[0.2em] relative z-10 inline-block px-4 bg-white pb-2">تـعـمـيـم</h1>
                               <div className="absolute top-[40%] left-0 w-full h-[2px] bg-gray-900 -translate-y-1/2 z-0"></div>
                             </div>

                             {/* Left: Logo area */}
                             <div className="flex justify-end">
                               <div className="w-24 h-24 border border-gray-900 flex items-center justify-center p-2">
                                 <div className="text-center font-bold text-gray-900 leading-tight">
                                   شعار<br/>غرفة<br/>مكة
                                 </div>
                               </div>
                             </div>
                           </div>

                           {/* Meta Info Box */}
                           <div className="border border-gray-900 px-4 py-2 rounded mb-10 flex flex-wrap justify-center items-center gap-2 text-xl font-bold bg-transparent">
                             <span>وارد من:</span>
                             <span className="text-gray-900">{circularIncomingFrom || "—"}</span>
                             <span className="mx-2">برقم:</span>
                             <span className="text-gray-900">{circularNumberDate ? circularNumberDate.split(" ")[0] : "—"}</span>
                             <span className="mx-2">وتاريخ:</span>
                             <span className="text-gray-900">{circularNumberDate ? circularNumberDate.split(" ").slice(1).join(" ") : "—"}</span>
                           </div>
                           
                           {/* Subject */}
                           <div className="text-center text-3xl font-bold text-gray-900 mb-12 leading-relaxed px-4 underline underline-offset-8 decoration-gray-400">
                             {circularSubject || "—"}
                           </div>

                           {/* Body */}
                           <div className="flex-1 flex flex-col mb-12">
                             <textarea 
                               value={aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText.split("نص توجيهي مقترح لإرساله للجان:")[1]?.trim() || aiGenGeneratedText} 
                               onChange={e => setAiGenGeneratedText("عرض التعميم:\\n" + e.target.value)}
                               className="flex-1 w-full bg-transparent text-gray-900 text-justify text-[22px] leading-[2.2] font-bold focus:outline-none resize-none min-h-[200px]"
                             />
                           </div>
                           
                           {/* Footer Horizontal Line */}
                           <div className="w-full h-[2px] bg-gray-400 mb-8 mt-auto"></div>
                           
                           {/* Footer (Contact & Attachments) */}
                           <div className="flex items-start justify-between">
                             {/* First item in RTL (Right side of paper): Attachments */}
                             <div className="flex items-start gap-2">
                               <span className="font-bold text-xl text-gray-900 mt-2">
                                 المرفقات:
                               </span>
                               <div className="flex flex-col gap-2">
                                 {(circularMainFile || circularAtt1 || circularAtt2 || circularAtt3) ? (
                                   <>
                                     {(circularMainFile && typeof circularMainFile === 'string' && circularMainFile !== "#") || (circularMainFile && typeof circularMainFile === 'object') ? (
                                       <div className="border border-gray-900 px-4 py-2 text-gray-900 font-bold bg-transparent text-lg">
                                         خطاب اتحاد الغرف
                                       </div>
                                     ) : null}
                                     {(circularAtt1 && typeof circularAtt1 === 'string' && circularAtt1 !== "#") || (circularAtt1 && typeof circularAtt1 === 'object') ? (
                                       <div className="border border-gray-900 px-4 py-2 text-gray-900 font-bold bg-transparent text-lg mt-2">
                                         مرفق 1
                                       </div>
                                     ) : null}
                                     {(circularAtt2 && typeof circularAtt2 === 'string' && circularAtt2 !== "#") || (circularAtt2 && typeof circularAtt2 === 'object') ? (
                                       <div className="border border-gray-900 px-4 py-2 text-gray-900 font-bold bg-transparent text-lg mt-2">
                                         مرفق 2
                                       </div>
                                     ) : null}
                                     {(circularAtt3 && typeof circularAtt3 === 'string' && circularAtt3 !== "#") || (circularAtt3 && typeof circularAtt3 === 'object') ? (
                                       <div className="border border-gray-900 px-4 py-2 text-gray-900 font-bold bg-transparent text-lg mt-2">
                                         مرفق 3
                                       </div>
                                     ) : null}
                                   </>
                                 ) : (
                                   <div className="border border-gray-900 px-4 py-2 text-gray-900 font-bold inline-block bg-transparent text-lg">
                                     لا توجد مرفقات
                                   </div>
                                 )}
                               </div>
                             </div>

                             {/* Last item in RTL (Left side of paper): Contact */}
                             <div className="space-y-4 text-left">
                               <div className="text-2xl font-bold text-gray-900 text-left w-full">
                                 الأستاذ / {employees.find(e => e.id === aiGenContact)?.name || "محمد الصيعري"}
                               </div>
                               <div className="flex items-center justify-end gap-3 mt-4 w-full">
                                  <span className="font-bold text-gray-800 text-lg">للتواصل:</span>
                                  <div className="border border-gray-900 px-4 py-1.5 font-bold text-gray-900 text-lg bg-transparent">جوال</div>
                                  <div className="border border-gray-900 px-4 py-1.5 font-bold text-gray-900 text-lg bg-transparent">بريد إلكتروني</div>
                               </div>
                             </div>
                           </div>
                        </div>
                      </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0 rounded-b-3xl">'''

if insertion_point in content:
    content = content.replace(insertion_point, step4_code)
    with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
        f.write(content)
    print("Insertion successful")
else:
    print("Insertion point not found")

