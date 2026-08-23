const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

// 1. Fix wrapper container:
content = content.replace(
  `                    <div className="flex-1 bg-slate-300/80 p-6 rounded-2xl overflow-y-auto flex justify-center items-center min-h-[75vh] border border-gray-300">
                      <div 
                        ref={circularPrintRef}
                        className="w-[1123px] h-[794px] min-w-[1123px] min-h-[794px] max-h-[794px] rounded-2xl shadow-2xl overflow-hidden relative shrink-0 flex flex-col justify-between font-sans"`,
  `                    <div className="flex-1 bg-slate-300/80 rounded-2xl overflow-hidden flex justify-center items-center min-h-[75vh] border border-gray-300 relative">
                      <div className="scale-[0.55] xl:scale-[0.65] 2xl:scale-[0.80] origin-center">
                        <div 
                          ref={circularPrintRef}
                          className="w-[1123px] h-[794px] min-w-[1123px] min-h-[794px] max-h-[794px] rounded-2xl shadow-2xl overflow-hidden relative shrink-0 flex flex-col justify-between font-sans"`
);

// We need to add the closing div for `<div className="scale-[0.65]...">`
content = content.replace(
  `                        {/* 6. شريط سفلي نحيف */}
                        <div className="h-1.5 w-full bg-[#133E87] shrink-0"></div>

                      </div>
                    </div>
                  </div>`,
  `                        {/* 6. شريط سفلي نحيف */}
                        <div className="h-1.5 w-full bg-[#133E87] shrink-0"></div>

                      </div>
                      </div>
                    </div>
                  </div>`
);

// 2. Fix Header:
content = content.replace(
  `                        {/* 2. الترويسة الرسمية */}
                        <div className="flex justify-between items-center px-12 pt-7 pb-3 shrink-0">
                          {/* اليمين: ملصق تعميم الغرفة */}
                          <div 
                            className="px-5 py-3 rounded-2xl shadow-sm text-right border border-slate-200/90"
                            style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)' }}
                          >
                            <div className="text-xs font-extrabold text-[#133E87] mb-1.5 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#C5A880]"></span>
                              <span>رقم التعميم:</span>
                              <span className="text-gray-900 font-black tracking-wider text-sm">{circularOutNumber || "—"}</span>
                            </div>
                            <div className="text-xs font-extrabold text-[#133E87] flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#C5A880]"></span>
                              <span>تاريـــــــخه:</span>
                              <span className="text-gray-900 font-black tracking-wider text-sm">{circularOutDate || "—"}</span>
                            </div>
                          </div>

                          {/* الوسط: كلمة تـعـمـيـم */}
                          <div className="text-center">
                            <h1 className="text-6xl text-[#133E87] font-bold tracking-widest leading-none" style={{ fontFamily: "'Amiri', serif" }}>
                              تـعـمـيـم
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent mx-auto mt-3 rounded-full"></div>
                          </div>

                          {/* اليسار: هوية غرفة مكة المكرمة */}
                          <div className="flex items-center gap-3.5">
                            <div className="text-left">
                              <span className="block font-black text-sm text-[#133E87] leading-tight">غرفة مكة المكرمة</span>
                              <span className="block text-[11px] text-gray-500 font-medium tracking-wide">Makkah Chamber</span>
                              <span className="block text-[10px] text-[#C5A880] font-bold mt-0.5">إدارة اللجان والقطاعات</span>
                            </div>
                            <div 
                              className="w-20 h-20 rounded-2xl shadow-sm border border-slate-200/90 flex items-center justify-center p-2 shrink-0"
                              style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}
                            >
                              <img
                                src={logoBase64}
                                alt="شعار غرفة مكة"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                        </div>`,
  `                        {/* 2. الترويسة الرسمية المغلفة بشريط كامل */}
                        <div className="px-12 pt-7 pb-3 shrink-0">
                          <div 
                            className="flex justify-between items-center px-8 py-5 rounded-3xl shadow-sm border border-slate-200/90"
                            style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)' }}
                          >
                            {/* اليمين: ملصق تعميم الغرفة */}
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-[#133E87] mb-2 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
                                <span>رقم التعميم:</span>
                                <span className="text-gray-900 font-black tracking-wider text-base">{circularOutNumber || "—"}</span>
                              </div>
                              <div className="text-sm font-extrabold text-[#133E87] flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
                                <span>تاريـــــــخه:</span>
                                <span className="text-gray-900 font-black tracking-wider text-base">{circularOutDate || "—"}</span>
                              </div>
                            </div>

                            {/* الوسط: كلمة تـعـمـيـم بخط الصفحة */}
                            <div className="text-center">
                              <h1 className="text-6xl text-[#133E87] font-black tracking-widest leading-none">
                                تـعـمـيـم
                              </h1>
                              <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent mx-auto mt-4 rounded-full"></div>
                            </div>

                            {/* اليسار: شعار غرفة مكة المكرمة (الشعار فقط) */}
                            <div className="flex items-center justify-end">
                              <div className="w-28 h-24 flex items-center justify-center shrink-0">
                                <img
                                  src={logoBase64}
                                  alt="شعار غرفة مكة"
                                  className="w-full h-full object-contain scale-125"
                                />
                              </div>
                            </div>
                          </div>
                        </div>`
);

// 3. Fix Attachments and Contact:
content = content.replace(
  `                        {/* 5. التذييل: المرفقات وبيانات التواصل في كبسولات عائمة */}
                        <div className="mx-12 mb-6 mt-2 pt-4 border-t border-slate-200/80 flex justify-between items-center shrink-0">
                          {/* اليمين: المرفقات */}
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-[#133E87] uppercase tracking-wider bg-[#133E87]/10 px-3 py-1.5 rounded-lg border border-[#133E87]/20">
                              المرفقات
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <a 
                                href={getAttachmentUrl(circularMainFile)} 
                                data-pdf-link={getAttachmentUrl(circularMainFile)} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-blue-100 transition-all shadow-sm"
                              >
                                📎 {circularAttachmentName || "المرفق الأساسي"}
                              </a>
                              {circularAtt1 && (
                                <a 
                                  href={getAttachmentUrl(circularAtt1)} 
                                  data-pdf-link={getAttachmentUrl(circularAtt1)} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-blue-100 transition-all shadow-sm"
                                >
                                  📎 مرفق إضافي 1
                                </a>
                              )}
                              {circularAtt2 && (
                                <a 
                                  href={getAttachmentUrl(circularAtt2)} 
                                  data-pdf-link={getAttachmentUrl(circularAtt2)} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-blue-100 transition-all shadow-sm"
                                >
                                  📎 مرفق إضافي 2
                                </a>
                              )}
                              {circularAtt3 && (
                                <a 
                                  href={getAttachmentUrl(circularAtt3)} 
                                  data-pdf-link={getAttachmentUrl(circularAtt3)} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-blue-100 transition-all shadow-sm"
                                >
                                  📎 مرفق إضافي 3
                                </a>
                              )}
                            </div>
                          </div>

                          {/* اليسار: بيانات مسؤول التواصل */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[11px] font-bold text-gray-500 block">للاستفسار والتواصل</span>
                              <span className="text-xs font-black text-gray-900">{circularContactName || "الأستاذ / محمد الصيعري"}</span>
                            </div>
                            <div className="flex items-center gap-2" dir="ltr">
                              {circularContactEmail && (
                                <a 
                                  href={\`mailto:\${circularContactEmail}\`} 
                                  data-pdf-link={\`mailto:\${circularContactEmail}\`} 
                                  className="bg-white/90 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
                                >
                                  ✉️ {circularContactEmail}
                                </a>
                              )}
                              {circularContactPhone && (
                                <a 
                                  href={\`tel:\${circularContactPhone}\`} 
                                  data-pdf-link={\`tel:\${circularContactPhone}\`} 
                                  className="bg-white/90 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
                                >
                                  📞 {circularContactPhone}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>`,
  `                        {/* 5. التذييل: المرفقات أعلى بيانات التواصل */}
                        <div className="mx-12 mb-6 mt-2 pt-4 border-t border-slate-200/80 flex flex-col gap-5 shrink-0">
                          {/* المرفقات (بالأعلى) */}
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-sm font-black text-[#133E87] uppercase tracking-wider bg-[#133E87]/10 px-4 py-2 rounded-xl border border-[#133E87]/20">
                              المرفقات
                            </span>
                            <div className="flex items-center gap-3 flex-wrap">
                              <a 
                                href={getAttachmentUrl(circularMainFile)} 
                                data-pdf-link={getAttachmentUrl(circularMainFile)} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 hover:bg-blue-100 transition-all shadow-sm"
                              >
                                📎 {circularAttachmentName || "المرفق الأساسي"}
                              </a>
                              {circularAtt1 && (
                                <a 
                                  href={getAttachmentUrl(circularAtt1)} 
                                  data-pdf-link={getAttachmentUrl(circularAtt1)} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 hover:bg-blue-100 transition-all shadow-sm"
                                >
                                  📎 مرفق إضافي 1
                                </a>
                              )}
                              {circularAtt2 && (
                                <a 
                                  href={getAttachmentUrl(circularAtt2)} 
                                  data-pdf-link={getAttachmentUrl(circularAtt2)} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 hover:bg-blue-100 transition-all shadow-sm"
                                >
                                  📎 مرفق إضافي 2
                                </a>
                              )}
                              {circularAtt3 && (
                                <a 
                                  href={getAttachmentUrl(circularAtt3)} 
                                  data-pdf-link={getAttachmentUrl(circularAtt3)} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 hover:bg-blue-100 transition-all shadow-sm"
                                >
                                  📎 مرفق إضافي 3
                                </a>
                              )}
                            </div>
                          </div>

                          {/* بيانات التواصل (بالأسفل) */}
                          <div className="flex items-center justify-between w-full bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-10 h-10 rounded-full bg-[#133E87]/10 flex items-center justify-center text-[#133E87]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              </span>
                              <div>
                                <span className="text-xs font-bold text-gray-500 block mb-0.5">للاستفسار والتواصل</span>
                                <span className="text-sm font-black text-gray-900">{circularContactName || "الأستاذ / محمد الصيعري"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3" dir="ltr">
                              {circularContactEmail && (
                                <a 
                                  href={\`mailto:\${circularContactEmail}\`} 
                                  data-pdf-link={\`mailto:\${circularContactEmail}\`} 
                                  className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-[#133E87] flex items-center gap-2 shadow-sm transition-all"
                                >
                                  ✉️ {circularContactEmail}
                                </a>
                              )}
                              {circularContactPhone && (
                                <a 
                                  href={\`tel:\${circularContactPhone}\`} 
                                  data-pdf-link={\`tel:\${circularContactPhone}\`} 
                                  className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-[#133E87] flex items-center gap-2 shadow-sm transition-all"
                                >
                                  📞 {circularContactPhone}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>`
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
