const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

content = content.replace(
  `                            {/* منطقة الترويسة الزجاجية */}
                            <div className="flex justify-between items-center px-8 py-5 shrink-0">
                              <div 
                                className="px-4 py-2.5 rounded-xl text-right text-xs shadow-sm border border-slate-200/80"
                                style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)' }}
                              >
                                <div className="font-extrabold text-[#133E87] flex items-center gap-1.5 mb-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
                                  <span>رقم التعميم:</span>
                                  <span className="text-gray-900 font-black tracking-wider">{circularOutNumber}</span>
                                </div>
                                <div className="font-extrabold text-[#133E87] flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
                                  <span>تاريـــــــخه:</span>
                                  <span className="text-gray-900 font-black tracking-wider">{circularOutDate}</span>
                                </div>
                              </div>

                              <div className="text-center">
                                <h1 className="text-4xl text-[#133E87] tracking-widest leading-none font-bold" >
                                  تـعـمـيـم
                                </h1>
                                <div className="w-16 h-[2.5px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent mx-auto mt-2 rounded-full"></div>
                              </div>

                              <div className="flex items-center gap-2.5">
                                <div className="text-left">
                                  <span className="block font-black text-xs text-[#133E87] leading-tight">غرفة مكة المكرمة</span>
                                  <span className="block text-[10px] text-gray-500 font-medium">Makkah Chamber</span>
                                </div>
                                <div 
                                  className="w-12 h-12 rounded-xl shadow-sm border border-slate-200/80 flex items-center justify-center p-1.5 shrink-0"
                                  style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}
                                >
                                  <img src={logoBase64} alt="شعار غرفة مكة" className="w-full h-full object-contain" />
                                </div>
                              </div>
                            </div>`,
  `                            {/* منطقة الترويسة الزجاجية المغلفة بشريط كامل */}
                            <div className="px-8 py-5 shrink-0">
                              <div 
                                className="flex justify-between items-center px-6 py-4 rounded-3xl text-right text-xs shadow-sm border border-slate-200/90"
                                style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)' }}
                              >
                                <div className="text-right">
                                  <div className="font-extrabold text-[#133E87] flex items-center gap-1.5 mb-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
                                    <span>رقم التعميم:</span>
                                    <span className="text-gray-900 font-black tracking-wider text-[13px]">{circularOutNumber}</span>
                                  </div>
                                  <div className="font-extrabold text-[#133E87] flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
                                    <span>تاريـــــــخه:</span>
                                    <span className="text-gray-900 font-black tracking-wider text-[13px]">{circularOutDate}</span>
                                  </div>
                                </div>

                                <div className="text-center">
                                  <h1 className="text-4xl text-[#133E87] tracking-widest leading-none font-black" >
                                    تـعـمـيـم
                                  </h1>
                                  <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent mx-auto mt-2.5 rounded-full"></div>
                                </div>

                                <div className="flex items-center justify-end">
                                  <div className="w-20 h-16 flex items-center justify-center shrink-0">
                                    <img src={logoBase64} alt="شعار غرفة مكة" className="w-full h-full object-contain scale-125" />
                                  </div>
                                </div>
                              </div>
                            </div>`
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
