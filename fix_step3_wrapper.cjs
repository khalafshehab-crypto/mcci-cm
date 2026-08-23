const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

content = content.replace(
  `                        <div className="lg:w-2/3 bg-slate-200/70 p-6 rounded-2xl overflow-y-auto flex items-center justify-center max-h-[70vh] border border-gray-200">
                          <div 
                            className="w-full max-w-[850px] rounded-2xl shadow-xl overflow-hidden border border-slate-200/90 relative transition-all flex flex-col justify-between"
                            style={{ 
                              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #FAF8F5 100%)',
                              boxShadow: '0 20px 40px -15px rgba(11, 37, 69, 0.08), 0 0 0 1px rgba(197, 168, 128, 0.25)' 
                            }}
                          >`,
  `                        <div className="lg:w-2/3 bg-slate-300/80 rounded-2xl overflow-hidden flex justify-center items-center min-h-[70vh] max-h-[70vh] border border-gray-300 relative">
                          <div className="scale-[0.50] xl:scale-[0.60] origin-center">
                            <div 
                              className="w-[1123px] h-[794px] min-w-[1123px] min-h-[794px] max-h-[794px] rounded-2xl shadow-2xl overflow-hidden border border-slate-200/90 relative transition-all flex flex-col justify-between shrink-0"
                              style={{ 
                                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #FAF8F5 100%)',
                                boxShadow: '0 20px 40px -15px rgba(11, 37, 69, 0.08), 0 0 0 1px rgba(197, 168, 128, 0.25)' 
                              }}
                            >`
);

// We need to add the closing div for the extra wrapper added above
content = content.replace(
  `                            {/* منطقة التذييل والمرفقات */}
                            <div className="px-8 py-3.5 shrink-0 flex justify-between items-center">
                              <div className="flex items-center gap-2 flex-wrap">`,
  `                            {/* منطقة التذييل والمرفقات */}
                            <div className="px-8 py-3.5 shrink-0 flex justify-between items-center">
                              <div className="flex items-center gap-2 flex-wrap">` // This is just a marker to find the bottom
);

content = content.replace(
  `                            {/* 6. شريط سفلي نحيف */}
                            <div className="h-1.5 w-full bg-[#133E87] shrink-0"></div>

                          </div>
                        </div>`,
  `                            {/* 6. شريط سفلي نحيف */}
                            <div className="h-1.5 w-full bg-[#133E87] shrink-0"></div>

                            </div>
                          </div>
                        </div>`
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
