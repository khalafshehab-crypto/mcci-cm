const fs = require('fs');
let file = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

file = file.replace(
  `                    <div className="flex-1 bg-slate-200/70 p-6 rounded-2xl overflow-y-auto flex justify-center h-[70vh] border border-gray-300">\n                      <div \n                        ref={circularPrintRef}\n                        className="w-[1000px] min-h-[707px] max-w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative my-auto shrink-0 flex flex-col"\n                        dir="rtl"\n                      >`,
  `                    <div className="flex-1 bg-slate-200/70 p-6 rounded-2xl overflow-auto flex justify-center items-center h-[70vh] border border-gray-300">\n                      <div \n                        ref={circularPrintRef}\n                        className="w-[1123px] h-[794px] min-w-[1123px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative shrink-0 flex flex-col"\n                        dir="rtl"\n                      >`
);

file = file.replace(
  `                            <div className="w-24 h-24 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-2 shrink-0">\n                              <img\n                                src={logoBase64}\n                                alt="شعار غرفة مكة"\n                                className="w-full h-full object-contain"\n                              />\n                            </div>`,
  `                            <div className="w-40 h-28 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-2 shrink-0">\n                              <img\n                                src={logoBase64}\n                                alt="شعار غرفة مكة"\n                                className="w-full h-full object-contain scale-125"\n                              />\n                            </div>`
);

file = file.replace(
  `                              <span className="text-gray-900 tracking-wider">{circularOutNumber || "—"}</span>\n                            </div>\n                            <div className="flex items-center gap-2">\n                              <span className="text-[#133E87]">التاريـــــــخ:</span>\n                              <span className="text-gray-900 tracking-wider">{circularOutDate || "—"}</span>`,
  `                              <span className="text-gray-900 tracking-wider border-b border-dashed border-gray-300 pb-0.5">{circularOutNumber || "—"}</span>\n                            </div>\n                            <div className="flex items-center gap-2">\n                              <span className="text-[#133E87]">التاريـــــــخ:</span>\n                              <span className="text-gray-900 tracking-wider border-b border-dashed border-gray-300 pb-0.5">{circularOutDate || "—"}</span>`
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', file);
