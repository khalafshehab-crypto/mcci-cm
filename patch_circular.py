import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

# 1. Add circularTypes state
if 'const [circularTypes, setCircularTypes] = useState<string[]>([])' not in content:
    content = content.replace('const [circularIncomingFrom, setCircularIncomingFrom] = useState("");', 'const [circularIncomingFrom, setCircularIncomingFrom] = useState("");\n  const [circularTypes, setCircularTypes] = useState<string[]>([]);')

# 2. Fix Step count logic
content = content.replace('الخطوة {aiGenStep} من 3', 'الخطوة {aiGenStep} من {workspaceService === "circular" ? 4 : 3}')

# 3. Replace step 3 and 4 rendering
# Find from {aiGenStep === 3 && ( to the matching end for step 3.
old_step_3 = '''                {aiGenStep === 3 && (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        {workspaceService === "circular" ? "بيانات التعميم المستخرجة" : "الخطاب المولد (يمكنك تعديله يدوياً قبل الطباعة أو الحفظ)"}
                      </h3>
                      {workspaceService !== "circular" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiGenGeneratedText);
                          showGlobalToast("تم نسخ الخطاب للمسودة", "success");
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> نسخ النص
                      </button>
                      )}
                    </div>
                    
                    {workspaceService === "circular" ? (
                      <div className="flex flex-col lg:flex-row gap-6 h-full">
                        <div className="lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
                          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                            <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">بيانات التعميم المستخرجة</h4>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1.5">التعميم وارد من</label>
                              <input type="text" value={circularIncomingFrom} onChange={e => setCircularIncomingFrom(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1.5">رقم وتاريخ التعميم</label>
                              <input type="text" value={circularNumberDate} onChange={e => setCircularNumberDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1.5">موضوع التعميم</label>
                              <input type="text" value={circularSubject} onChange={e => setCircularSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1.5">عرض التعميم (النص التوجيهي)</label>
                              <textarea value={aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText.split("نص توجيهي مقترح لإرساله للجان:")[1]?.trim() || aiGenGeneratedText} onChange={e => setAiGenGeneratedText("عرض التعميم:\\n" + e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-sm min-h-[150px] resize-none" />
                            </div>
                          </div>
                        </div>
                        <div className="lg:w-2/3 bg-gray-200/80 p-4 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
                          <div className="bg-white shadow-xl border border-gray-300 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mx-auto shrink-0 transition-all p-12 sm:p-16 text-[16px] leading-[2.2] font-sans">
                             <div className="border-b-2 border-gray-800 pb-4 mb-6 text-center">
                               <h1 className="text-2xl font-black text-gray-900 mb-2">تعميم داخلي</h1>
                               <h2 className="text-lg font-bold text-gray-700">{aiGenCommittees.map(id => committees.find(c => String(c.id) === id)?.name || id).join("، ")}</h2>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                               <div><span className="font-bold text-gray-900">إلى:</span> جميع أعضاء اللجان الموقرين</div>
                               <div><span className="font-bold text-gray-900">من:</span> إدارة اللجان</div>
                               <div><span className="font-bold text-gray-900">وارد من:</span> {circularIncomingFrom || "—"}</div>
                               <div><span className="font-bold text-gray-900">التاريخ والرقم:</span> {circularNumberDate || "—"}</div>
                               <div className="col-span-2"><span className="font-bold text-gray-900">الموضوع:</span> {circularSubject || "—"}</div>
                             </div>
                             <div className="flex-1 whitespace-pre-wrap text-justify">
                               {aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText.split("نص توجيهي مقترح لإرساله للجان:")[1]?.trim() || aiGenGeneratedText}
                             </div>
                             
                             <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                               <p className="font-bold text-gray-800">شاكرين ومقدرين تعاونكم،،،</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                    <div className="flex-1 bg-gray-200/80 p-4 sm:p-8 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
                      <div className="bg-white shadow-xl border border-gray-300 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mx-auto shrink-0 transition-all">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => setAiGenGeneratedText(e.currentTarget.innerText)}
                          className="flex-1 w-full p-12 sm:p-16 text-[16px] leading-[2.2] text-justify font-sans focus:outline-none bg-transparent whitespace-pre-wrap outline-none"
                        >
                          {aiGenGeneratedText}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                )}'''

new_step_3_and_4 = '''                {aiGenStep === 3 && workspaceService === "circular" && (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        بيانات التعميم المستخرجة
                      </h3>
                    </div>
                    <div className="flex-1 bg-gray-50 p-6 rounded-2xl border border-gray-200 overflow-y-auto flex flex-col gap-6">
                      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5 max-w-2xl mx-auto w-full">
                        <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-3 text-lg">تحديد نوع التعميم</h4>
                        <div className="flex flex-wrap gap-3">
                          {["عادي", "عاجل", "هام"].map(type => (
                            <button
                              key={type}
                              onClick={() => setCircularTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])}
                              className={`px-6 py-2.5 rounded-full font-bold text-sm border-2 transition-all ${circularTypes.includes(type) ? 'border-[#0B1A35] bg-[#0B1A35] text-white shadow-md' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5 max-w-2xl mx-auto w-full">
                        <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-3 text-lg">تفاصيل التعميم</h4>
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-2">التعميم وارد من</label>
                          <input type="text" value={circularIncomingFrom} onChange={e => setCircularIncomingFrom(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#0B1A35]/20 focus:border-[#0B1A35] outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-2">رقم وتاريخ التعميم</label>
                          <input type="text" value={circularNumberDate} onChange={e => setCircularNumberDate(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#0B1A35]/20 focus:border-[#0B1A35] outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-2">موضوع التعميم</label>
                          <input type="text" value={circularSubject} onChange={e => setCircularSubject(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#0B1A35]/20 focus:border-[#0B1A35] outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-2">عرض التعميم (النص التوجيهي)</label>
                          <textarea value={aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText.split("نص توجيهي مقترح لإرساله للجان:")[1]?.trim() || aiGenGeneratedText} onChange={e => setAiGenGeneratedText("عرض التعميم:\\n" + e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl font-bold text-sm min-h-[200px] resize-none focus:ring-2 focus:ring-[#0B1A35]/20 focus:border-[#0B1A35] outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {((aiGenStep === 4 && workspaceService === "circular") || (aiGenStep === 3 && workspaceService !== "circular")) && (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        {workspaceService === "circular" ? "المعاينة النهائية للتعميم" : "الخطاب المولد (يمكنك تعديله يدوياً قبل الطباعة أو الحفظ)"}
                      </h3>
                      {workspaceService !== "circular" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiGenGeneratedText);
                          showGlobalToast("تم نسخ الخطاب للمسودة", "success");
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> نسخ النص
                      </button>
                      )}
                    </div>
                    
                    {workspaceService === "circular" ? (
                      <div className="flex-1 bg-gray-200/80 p-4 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
                        <div 
                          ref={circularPrintRef}
                          className="bg-white shadow-2xl border border-gray-200 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mx-auto shrink-0 transition-all p-12 sm:p-16 text-[18px] leading-[2.2] font-sans text-gray-900 relative"
                        >
                           {/* Header */}
                           <div className="flex items-start justify-between mb-10">
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
                           </div>

                           {/* Title */}
                           <div className="text-center mb-8 relative">
                             <h1 className="text-5xl font-black text-gray-900 tracking-[0.2em] relative z-10 inline-block px-8 bg-white pb-2">تـعـمـيـم</h1>
                             <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-300 -translate-y-1/2 z-0"></div>
                             {circularTypes.length > 0 && (
                               <div className="mt-4 flex justify-center gap-2 relative z-10">
                                 {circularTypes.map(type => (
                                   <span key={type} className="px-4 py-1 border border-gray-800 text-gray-900 rounded-full text-sm font-bold bg-white">
                                     {type}
                                   </span>
                                 ))}
                               </div>
                             )}
                           </div>

                           {/* Meta Info */}
                           <div className="border-2 border-gray-800 p-4 rounded-xl mb-10 flex items-center flex-wrap gap-2 text-xl font-bold bg-gray-50">
                             <span>وارد من:</span>
                             <span className="text-gray-700">{circularIncomingFrom || "—"}</span>
                             <span className="mx-2">برقم:</span>
                             <span className="text-gray-700">{circularNumberDate ? circularNumberDate.split(" ")[0] : "—"}</span>
                             <span className="mx-2">وتاريخ:</span>
                             <span className="text-gray-700">{circularNumberDate ? circularNumberDate.split(" ").slice(1).join(" ") : "—"}</span>
                           </div>
                           
                           {/* Body */}
                           <div className="flex-1 flex flex-col mb-12">
                             <div className="text-center text-3xl font-bold text-gray-900 mb-10 leading-relaxed px-4">
                               {circularSubject || "—"}
                             </div>
                             <textarea 
                               value={aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText.split("نص توجيهي مقترح لإرساله للجان:")[1]?.trim() || aiGenGeneratedText} 
                               onChange={e => setAiGenGeneratedText("عرض التعميم:\\n" + e.target.value)}
                               className="flex-1 w-full bg-transparent text-gray-900 text-justify text-[20px] leading-[2.2] focus:outline-none resize-none min-h-[200px]"
                             />
                           </div>
                           
                           {/* Footer Horizontal Line */}
                           <div className="w-full h-[2px] bg-gray-300 mb-8"></div>
                           
                           {/* Footer & Attachments */}
                           <div className="flex items-start justify-between">
                             {/* Contact Info */}
                             <div className="space-y-4">
                               <div className="text-xl font-bold text-gray-900">
                                 الأستاذ/ {employees.find(e => e.id === aiGenContact)?.name || "محمد الصيعري"}
                               </div>
                               <div className="flex items-center gap-3">
                                  <span className="font-bold text-gray-600">للتواصل:</span>
                                  <div className="border border-gray-400 px-4 py-1.5 rounded-lg font-bold text-gray-800 text-sm">جوال</div>
                                  <div className="border border-gray-400 px-4 py-1.5 rounded-lg font-bold text-gray-800 text-sm">بريد إلكتروني</div>
                               </div>
                             </div>

                             {/* Attachments */}
                             <div className="border-2 border-gray-800 p-4 rounded-xl min-w-[200px] bg-gray-50" data-html2canvas-ignore="true">
                               <div className="font-bold text-xl text-gray-900 mb-3 flex items-center gap-2">
                                 المرفقات:
                               </div>
                               <div className="flex flex-col gap-2">
                                 {circularMainFile && typeof circularMainFile === 'string' && circularMainFile !== "#" && (
                                   <a href={circularMainFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
                                     خطاب اتحاد الغرف
                                   </a>
                                 )}
                                 {circularAtt1 && typeof circularAtt1 === 'string' && circularAtt1 !== "#" && (
                                   <a href={circularAtt1} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
                                     مرفق 1
                                   </a>
                                 )}
                                 {circularAtt2 && typeof circularAtt2 === 'string' && circularAtt2 !== "#" && (
                                   <a href={circularAtt2} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
                                     مرفق 2
                                   </a>
                                 )}
                                 {circularAtt3 && typeof circularAtt3 === 'string' && circularAtt3 !== "#" && (
                                   <a href={circularAtt3} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
                                     مرفق 3
                                   </a>
                                 )}
                               </div>
                             </div>
                           </div>
                        </div>
                      </div>
                    ) : (
                    <div className="flex-1 bg-gray-200/80 p-4 sm:p-8 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
                      <div className="bg-white shadow-xl border border-gray-300 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mx-auto shrink-0 transition-all">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => setAiGenGeneratedText(e.currentTarget.innerText)}
                          className="flex-1 w-full p-12 sm:p-16 text-[16px] leading-[2.2] text-justify font-sans focus:outline-none bg-transparent whitespace-pre-wrap outline-none"
                        >
                          {aiGenGeneratedText}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                )}'''

content = content.replace(old_step_3, new_step_3_and_4)

# 4. Update action buttons conditions (Next button)
# We need to add a "التالي" button if aiGenStep === 3 and workspaceService === "circular"
# Currently in the footer of the modal:
#                 {aiGenStep === 3 && workspaceService === "circular" && (
#                  <button onClick={handleDownloadPDF} ...

buttons_old = '''                {aiGenStep === 3 && workspaceService === "circular" && (
                  <button
                    onClick={handleDownloadPDF}
                    className="px-6 py-2.5 bg-[#0B1A35] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" /> حفظ التصميم وتصدير PDF
                  </button>
                )}
                {aiGenStep === 3 && (
                  <div className="flex items-center gap-3">
                    <button'''

buttons_new = '''                {aiGenStep === 3 && workspaceService === "circular" && (
                  <button
                    onClick={() => setAiGenStep(4)}
                    className="px-6 py-2.5 bg-[#0B1A35] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    معاينة التصميم النهائي <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {aiGenStep === 4 && workspaceService === "circular" && (
                  <button
                    onClick={handleDownloadPDF}
                    className="px-6 py-2.5 bg-[#0B1A35] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" /> تصدير PDF
                  </button>
                )}
                {((aiGenStep === 4 && workspaceService === "circular") || (aiGenStep === 3 && workspaceService !== "circular")) && (
                  <div className="flex items-center gap-3">
                    <button'''

content = content.replace(buttons_old, buttons_new)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)

