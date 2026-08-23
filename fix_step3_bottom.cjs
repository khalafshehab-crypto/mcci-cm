const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

content = content.replace(
  `                            {/* خط فاصل ناعم */}
                            <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-8 shrink-0"></div>

                            {/* منطقة التذييل والمرفقات */}
                            <div className="px-8 py-3.5 shrink-0 flex justify-between items-center">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-[#133E87] bg-[#133E87]/10 px-2.5 py-1 rounded-lg border border-[#133E87]/20">
                                  المرفقات:
                                </span>
                                <a href={getAttachmentUrl(circularMainFile)} target="_blank" rel="noreferrer" className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 hover:bg-blue-100 transition-all shadow-sm">
                                  📎 {circularAttachmentName || "المرفق الأساسي"}
                                </a>
                                {circularAtt1 && (
                                   <a href={getAttachmentUrl(circularAtt1)} target="_blank" rel="noreferrer" className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 hover:bg-blue-100 transition-all shadow-sm">
                                     📎 مرفق 1
                                   </a>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-xs font-bold text-[#133E87]">
                                  للتواصل: <span className="text-gray-900 font-black">{circularContactName || "الأستاذ / محمد الصيعري"}</span>
                                </div>
                                <div className="flex gap-2 text-xs text-slate-600 font-semibold" dir="ltr">
                                  {circularContactEmail && <a href={\`mailto:\${circularContactEmail}\`} className="bg-white/90 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors shadow-sm">✉️ {circularContactEmail}</a>}
                                  {circularContactPhone && <a href={\`tel:\${circularContactPhone}\`} className="bg-white/90 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors shadow-sm">📞 {circularContactPhone}</a>}
                                </div>
                              </div>
                            </div>`,
  `                            {/* 5. التذييل: المرفقات أعلى بيانات التواصل */}
                            <div className="mx-8 mb-4 mt-1 pt-3 border-t border-slate-200/80 flex flex-col gap-4 shrink-0">
                              {/* المرفقات (بالأعلى) */}
                              <div className="flex items-center gap-2.5 w-full">
                                <span className="text-[11px] font-black text-[#133E87] uppercase tracking-wider bg-[#133E87]/10 px-3 py-1.5 rounded-lg border border-[#133E87]/20">
                                  المرفقات
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <a 
                                    href={getAttachmentUrl(circularMainFile)} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-3 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 hover:bg-blue-100 transition-all shadow-sm"
                                  >
                                    📎 {circularAttachmentName || "المرفق الأساسي"}
                                  </a>
                                  {circularAtt1 && (
                                    <a 
                                      href={getAttachmentUrl(circularAtt1)} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-3 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 hover:bg-blue-100 transition-all shadow-sm"
                                    >
                                      📎 مرفق 1
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* بيانات التواصل (بالأسفل) */}
                              <div className="flex items-center justify-between w-full bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-8 h-8 rounded-full bg-[#133E87]/10 flex items-center justify-center text-[#133E87]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                  </span>
                                  <div>
                                    <span className="text-[10px] font-bold text-gray-500 block mb-0.5">للاستفسار والتواصل</span>
                                    <span className="text-xs font-black text-gray-900">{circularContactName || "الأستاذ / محمد الصيعري"}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5" dir="ltr">
                                  {circularContactEmail && (
                                    <a 
                                      href={\`mailto:\${circularContactEmail}\`} 
                                      className="bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#133E87] flex items-center gap-1.5 shadow-sm transition-all"
                                    >
                                      ✉️ {circularContactEmail}
                                    </a>
                                  )}
                                  {circularContactPhone && (
                                    <a 
                                      href={\`tel:\${circularContactPhone}\`} 
                                      className="bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#133E87] flex items-center gap-1.5 shadow-sm transition-all"
                                    >
                                      📞 {circularContactPhone}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>`
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
