import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

# Add imports for jspdf and html2canvas if not exists
if 'import jsPDF' not in content:
    content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport jsPDF from 'jspdf';\nimport html2canvas from 'html2canvas';")

# Add state for auto-generated circular out number and date
state_block = '''  const [circularIncomingFrom, setCircularIncomingFrom] = useState("");
  const [circularNumberDate, setCircularNumberDate] = useState("");
  const [circularSubject, setCircularSubject] = useState("");'''

new_state_block = '''  const [circularIncomingFrom, setCircularIncomingFrom] = useState("");
  const [circularNumberDate, setCircularNumberDate] = useState("");
  const [circularSubject, setCircularSubject] = useState("");
  
  const [circularOutNumber, setCircularOutNumber] = useState(`CIR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [circularOutDate, setCircularOutDate] = useState(new Date().toLocaleDateString('ar-SA'));
  const circularPrintRef = useRef<HTMLDivElement>(null);
  
  const handleDownloadPDF = async () => {
    if (!circularPrintRef.current) return;
    try {
      showGlobalToast("جاري تحضير ملف PDF...", "info");
      const canvas = await html2canvas(circularPrintRef.current, { scale: 2, useCORS: true, backgroundColor: '#0B1A35' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`تعميم_${circularOutNumber}.pdf`);
      showGlobalToast("تم تحميل التعميم بنجاح", "success");
    } catch (err) {
      console.error(err);
      showGlobalToast("حدث خطأ أثناء التصدير", "error");
    }
  };'''

if 'circularOutNumber' not in content:
    content = content.replace(state_block, new_state_block)

old_preview = '''                        <div className="lg:w-2/3 bg-gray-200/80 p-4 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
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
                        </div>'''

new_preview = '''                        <div className="lg:w-2/3 bg-gray-200/80 p-4 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
                          <div 
                            ref={circularPrintRef}
                            className="bg-[#0B1A35] shadow-xl border border-gray-800 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mx-auto shrink-0 transition-all p-12 sm:p-16 text-[16px] leading-[2] font-sans text-white relative"
                          >
                             {/* Header */}
                             <div className="flex items-start justify-between mb-10">
                               {/* Logo area */}
                               <div className="flex items-center gap-3">
                                 <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                                   <Building2 className="w-8 h-8 text-white" />
                                 </div>
                                 <div>
                                   <div className="font-black text-xl text-white tracking-wide">غرفة مكة المكرمة</div>
                                   <div className="text-white/70 text-sm">Makkah Chamber</div>
                                 </div>
                               </div>
                               {/* Auto Info */}
                               <div className="text-left text-sm text-white/90 space-y-2">
                                 <div className="flex items-center justify-end gap-2">
                                    <span className="font-bold text-white/70">رقم التعميم:</span>
                                    <input type="text" value={circularOutNumber} onChange={e => setCircularOutNumber(e.target.value)} className="bg-transparent border-b border-white/30 text-white text-left w-32 focus:outline-none focus:border-white" />
                                 </div>
                                 <div className="flex items-center justify-end gap-2">
                                    <span className="font-bold text-white/70">التاريخ:</span>
                                    <input type="text" value={circularOutDate} onChange={e => setCircularOutDate(e.target.value)} className="bg-transparent border-b border-white/30 text-white text-left w-32 focus:outline-none focus:border-white" />
                                 </div>
                               </div>
                             </div>

                             {/* Title */}
                             <div className="text-center mb-8 relative">
                               <h1 className="text-4xl font-black text-white tracking-widest relative z-10 inline-block px-6 bg-[#0B1A35]">تـعـمـيـم</h1>
                               <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20 -translate-y-1/2 z-0"></div>
                             </div>

                             {/* Meta Info */}
                             <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 space-y-3 shadow-inner">
                               <div className="flex items-start gap-2">
                                 <span className="font-bold text-white/60 min-w-[120px]">وارد من:</span>
                                 <input type="text" value={circularIncomingFrom} onChange={e => setCircularIncomingFrom(e.target.value)} className="bg-transparent text-white font-bold w-full focus:outline-none border-b border-transparent focus:border-white/30 transition-colors" />
                               </div>
                               <div className="flex items-start gap-2">
                                 <span className="font-bold text-white/60 min-w-[120px]">رقم وتاريخ الوارد:</span>
                                 <input type="text" value={circularNumberDate} onChange={e => setCircularNumberDate(e.target.value)} className="bg-transparent text-white font-bold w-full focus:outline-none border-b border-transparent focus:border-white/30 transition-colors" />
                               </div>
                               <div className="flex items-start gap-2">
                                 <span className="font-bold text-white/60 min-w-[120px]">الموضوع:</span>
                                 <textarea value={circularSubject} onChange={e => setCircularSubject(e.target.value)} rows={2} className="bg-transparent text-white font-bold w-full focus:outline-none border-b border-transparent focus:border-white/30 resize-none transition-colors leading-relaxed" />
                               </div>
                             </div>
                             
                             {/* Body */}
                             <div className="flex-1 flex flex-col mb-12">
                               <div className="font-bold text-lg mb-6">إلى: جميع أعضاء اللجان الموقرين</div>
                               <textarea 
                                 value={aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText.split("نص توجيهي مقترح لإرساله للجان:")[1]?.trim() || aiGenGeneratedText} 
                                 onChange={e => setAiGenGeneratedText("عرض التعميم:\\n" + e.target.value)}
                                 className="flex-1 w-full bg-transparent text-white text-justify text-[16px] leading-[2.2] focus:outline-none resize-none min-h-[300px]"
                               />
                             </div>
                             
                             {/* Footer & Attachments */}
                             <div className="mt-auto">
                               <div className="border-t border-white/20 pt-8 flex items-end justify-between">
                                 <div className="space-y-1">
                                    <div className="text-white/60 text-sm font-bold">صادر من:</div>
                                    <div className="text-lg font-black text-white">إدارة اللجان</div>
                                 </div>
                                 <div className="space-y-1 text-left">
                                    <div className="text-white font-bold">شاكرين ومقدرين تعاونكم،،،</div>
                                 </div>
                               </div>

                               {/* Attachments Pills */}
                               <div className="mt-8 flex flex-wrap gap-3" data-html2canvas-ignore="true">
                                 {circularMainFile && typeof circularMainFile === 'string' && circularMainFile !== "#" && (
                                   <a href={circularMainFile} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-[#0B1A35] hover:bg-gray-100 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-1">
                                     <Paperclip className="w-4 h-4" /> التعميم الأساسي
                                   </a>
                                 )}
                                 {circularAtt1 && typeof circularAtt1 === 'string' && circularAtt1 !== "#" && (
                                   <a href={circularAtt1} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
                                     <Paperclip className="w-4 h-4" /> مرفق 1
                                   </a>
                                 )}
                                 {circularAtt2 && typeof circularAtt2 === 'string' && circularAtt2 !== "#" && (
                                   <a href={circularAtt2} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
                                     <Paperclip className="w-4 h-4" /> مرفق 2
                                   </a>
                                 )}
                                 {circularAtt3 && typeof circularAtt3 === 'string' && circularAtt3 !== "#" && (
                                   <a href={circularAtt3} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
                                     <Paperclip className="w-4 h-4" /> مرفق 3
                                   </a>
                                 )}
                               </div>
                             </div>
                          </div>
                        </div>'''

content = content.replace(old_preview, new_preview)

# Add "Save as PDF" button
old_buttons = '''                {aiGenStep === 3 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const printWin = window.open('', '_blank');'''

new_buttons = '''                {aiGenStep === 3 && workspaceService === "circular" && (
                  <button
                    onClick={handleDownloadPDF}
                    className="px-6 py-2.5 bg-[#0B1A35] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" /> حفظ التصميم وتصدير PDF
                  </button>
                )}
                {aiGenStep === 3 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const printWin = window.open('', '_blank');'''

content = content.replace(old_buttons, new_buttons)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
