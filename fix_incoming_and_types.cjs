const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

// --- 1. Step 3 Header with Circular Types ---
content = content.replace(
  `                                <div className="text-center">
                                  <h1 className="text-4xl text-[#133E87] tracking-widest leading-none font-black" >
                                    تـعـمـيـم
                                  </h1>
                                  <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent mx-auto mt-2.5 rounded-full"></div>
                                </div>`,
  `                                <div className="text-center relative">
                                  <h1 className="text-4xl text-[#133E87] tracking-widest leading-none font-black" >
                                    تـعـمـيـم
                                  </h1>
                                  <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent mx-auto mt-2.5 rounded-full"></div>
                                  
                                  {circularTypes.length > 0 && circularTypes.some(t => t !== "عادي") && (
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-1.5 w-full">
                                      {circularTypes.filter(t => t !== "عادي").map(t => (
                                        <span key={t} className="px-2 py-0.5 rounded-md border border-red-600 text-red-600 text-[10px] font-black tracking-widest bg-white">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>`
);

// --- 2. Step 4 Header with Circular Types ---
content = content.replace(
  `                            {/* الوسط: كلمة تـعـمـيـم بخط الصفحة */}
                            <div className="text-center">
                              <h1 className="text-6xl text-[#133E87] font-black tracking-widest leading-none">
                                تـعـمـيـم
                              </h1>
                              <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent mx-auto mt-4 rounded-full"></div>
                            </div>`,
  `                            {/* الوسط: كلمة تـعـمـيـم بخط الصفحة */}
                            <div className="text-center relative">
                              <h1 className="text-6xl text-[#133E87] font-black tracking-widest leading-none">
                                تـعـمـيـم
                              </h1>
                              <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent mx-auto mt-4 rounded-full"></div>
                              
                              {circularTypes.length > 0 && circularTypes.some(t => t !== "عادي") && (
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex justify-center gap-2 w-full">
                                  {circularTypes.filter(t => t !== "عادي").map(t => (
                                    <span key={t} className="px-3 py-1 rounded-md border-2 border-red-600 text-red-600 text-[13px] font-black tracking-widest bg-white">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>`
);

// --- 3. Step 3 Incoming Bar ---
content = content.replace(
  `                            {/* شريط الوارد والمرجعية الزجاجي */}
                            <div className="mx-8 my-2 shrink-0">
                              <div 
                                className="px-6 py-2.5 rounded-xl flex justify-between items-center text-xs text-slate-800 font-bold shadow-sm border border-slate-200/80"
                                style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)' }}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#C5A880]"></span>
                                  <strong className="text-[#133E87]">الوارد من:</strong> <span className="text-gray-900 font-bold border-b border-dashed border-gray-400 pb-0.5">{circularIncomingFrom || "—"}</span>
                                </span>
                                <span><strong className="text-[#133E87]">برقم:</strong> <span className="text-gray-900 font-bold border-b border-dashed border-gray-400 pb-0.5">{circularIncomingNumber || "—"}</span></span>
                                <span><strong className="text-[#133E87]">بتاريخ:</strong> <span className="text-gray-900 font-bold border-b border-dashed border-gray-400 pb-0.5">{circularIncomingDate || "—"}</span></span>
                              </div>
                            </div>`,
  `                            {/* شريط الوارد والمرجعية */}
                            <div className="mx-8 my-2 shrink-0 mt-6">
                              <div className="px-6 py-2.5 rounded-xl flex justify-between items-center text-xs font-bold shadow-sm border border-[#133E87]/20 bg-[#133E87]/10 text-[#133E87]">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#C5A880]"></span>
                                  <strong className="text-[#133E87]">الوارد من:</strong> 
                                  <span className="text-[#133E87] font-black border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingFrom || "—"}</span>
                                </span>
                                <span><strong className="text-[#133E87]">برقم:</strong> <span className="text-[#133E87] font-black border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingNumber || "—"}</span></span>
                                <span><strong className="text-[#133E87]">بتاريخ:</strong> <span className="text-[#133E87] font-black border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingDate || "—"}</span></span>
                              </div>
                            </div>`
);

// --- 4. Step 4 Incoming Bar ---
content = content.replace(
  `                        {/* 3. شريط الوارد والمرجعية الزجاجي */}
                        <div className="mx-12 my-2 shrink-0">
                          <div 
                            className="px-8 py-3.5 rounded-2xl flex justify-between items-center text-sm shadow-sm border border-slate-200/90"
                            style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)' }}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-[#C5A880] bg-[#133E87]/10 px-2.5 py-1 rounded-lg">وارد من</span>
                              <span className="font-extrabold text-gray-900 border-b border-dashed border-gray-400 pb-0.5">{circularIncomingFrom || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500">برقم:</span>
                              <span className="font-black text-[#133E87] tracking-wider border-b border-dashed border-gray-400 pb-0.5">{circularIncomingNumber || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500">بتاريخ:</span>
                              <span className="font-black text-[#133E87] tracking-wider border-b border-dashed border-gray-400 pb-0.5">{circularIncomingDate || "—"}</span>
                            </div>
                          </div>
                        </div>`,
  `                        {/* 3. شريط الوارد والمرجعية */}
                        <div className="mx-12 my-2 shrink-0 mt-8">
                          <div className="px-8 py-3.5 rounded-2xl flex justify-between items-center text-sm shadow-sm border border-[#133E87]/20 bg-[#133E87]/10 text-[#133E87]">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-[#C5A880] bg-[#133E87]/10 px-2.5 py-1 rounded-lg">وارد من</span>
                              <span className="font-black text-[#133E87] border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingFrom || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500">برقم:</span>
                              <span className="font-black text-[#133E87] tracking-wider border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingNumber || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500">بتاريخ:</span>
                              <span className="font-black text-[#133E87] tracking-wider border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingDate || "—"}</span>
                            </div>
                          </div>
                        </div>`
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
