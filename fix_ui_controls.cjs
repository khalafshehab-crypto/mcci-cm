const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

const UI_CONTROLS_REPLACE = `                            <h4 className="font-bold text-[#133E87] border-b border-gray-100 pb-2 text-sm flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#C5A880]" />
                              بيانات التعميم المستخرجة
                            </h4>
                            
                            {/* أنواع التعميم */}
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1.5">أهمية / نوع التعميم</label>
                              <div className="flex flex-wrap gap-2">
                                {["عادي", "هام", "عاجل", "سري"].map(t => (
                                  <button
                                    key={t}
                                    onClick={() => {
                                      if (circularTypes.includes(t)) {
                                        setCircularTypes(circularTypes.filter(x => x !== t));
                                      } else {
                                        setCircularTypes([...circularTypes, t]);
                                      }
                                    }}
                                    className={\`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors \${circularTypes.includes(t) ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}\`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>`;

content = content.replace(
  `                            <h4 className="font-bold text-[#133E87] border-b border-gray-100 pb-2 text-sm flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#C5A880]" />
                              بيانات التعميم المستخرجة
                            </h4>`,
  UI_CONTROLS_REPLACE
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
