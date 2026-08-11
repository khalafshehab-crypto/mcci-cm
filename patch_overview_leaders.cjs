const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const target = `              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h5 className="text-xs font-black text-gray-500 border-b border-gray-100 pb-2">قيادات اللجنة</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-black block">رئيس اللجنة</span>
                      <span className="text-xs font-extrabold text-blue-900">{presidentName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-black block">نائب رئيس اللجنة</span>
                      <span className="text-xs font-extrabold text-purple-900">{vicePresidentName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-gray-650 rounded-xl">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-black block">الموظف الأخصائي المسؤول</span>
                      <span className="text-xs font-extrabold text-gray-800">{detailsComm.specialist || "غير محدد"}</span>
                    </div>
                  </div>
                </div>
              </div>`;

const replacement = `              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h5 className="text-xs font-black text-gray-500 border-b border-gray-100 pb-2">قيادات اللجنة</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-black block">رئيس اللجنة</span>
                        <span className="text-xs font-extrabold text-blue-900">{presidentName}</span>
                      </div>
                    </div>
                    {actualPresident && (actualPresident.cv || actualPresident.commercialRegister || actualPresident.membershipCertificate || actualPresident.authorization) && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[
                          { label: "السيرة", value: actualPresident.cv },
                          { label: "السجل", value: actualPresident.commercialRegister },
                          { label: "الاشتراك", value: actualPresident.membershipCertificate },
                          { label: "التفويض", value: actualPresident.authorization }
                        ].map((doc, idx) => doc.value ? (
                          <div key={idx} className="flex items-center gap-1 p-1 px-1.5 bg-gray-50 rounded border border-gray-100">
                            <Paperclip className="w-2.5 h-2.5 text-blue-500" />
                            <span className="text-[8px] font-bold text-gray-700">{doc.label}</span>
                            <a 
                              href={typeof doc.value === 'string' && doc.value.startsWith('http') ? doc.value : '#'}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-4 h-4 flex items-center justify-center bg-white border border-gray-200 rounded text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm"
                              title="عرض المرفق"
                              onClick={(e) => {
                                if (typeof doc.value === 'string' && !doc.value.startsWith('http')) {
                                  e.preventDefault();
                                  alert('المرفق محلي وغير متوفر كرابط.');
                                }
                              }}
                            >
                              <Eye className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        ) : null)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-black block">نائب رئيس اللجنة</span>
                        <span className="text-xs font-extrabold text-purple-900">{vicePresidentName}</span>
                      </div>
                    </div>
                    {actualVice && (actualVice.cv || actualVice.commercialRegister || actualVice.membershipCertificate || actualVice.authorization) && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[
                          { label: "السيرة", value: actualVice.cv },
                          { label: "السجل", value: actualVice.commercialRegister },
                          { label: "الاشتراك", value: actualVice.membershipCertificate },
                          { label: "التفويض", value: actualVice.authorization }
                        ].map((doc, idx) => doc.value ? (
                          <div key={idx} className="flex items-center gap-1 p-1 px-1.5 bg-gray-50 rounded border border-gray-100">
                            <Paperclip className="w-2.5 h-2.5 text-blue-500" />
                            <span className="text-[8px] font-bold text-gray-700">{doc.label}</span>
                            <a 
                              href={typeof doc.value === 'string' && doc.value.startsWith('http') ? doc.value : '#'}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-4 h-4 flex items-center justify-center bg-white border border-gray-200 rounded text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm"
                              title="عرض المرفق"
                              onClick={(e) => {
                                if (typeof doc.value === 'string' && !doc.value.startsWith('http')) {
                                  e.preventDefault();
                                  alert('المرفق محلي وغير متوفر كرابط.');
                                }
                              }}
                            >
                              <Eye className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        ) : null)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 h-fit">
                    <div className="p-2 bg-slate-100 text-gray-650 rounded-xl">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-black block">الموظف الأخصائي المسؤول</span>
                      <span className="text-xs font-extrabold text-gray-800">{detailsComm.specialist || "غير محدد"}</span>
                    </div>
                  </div>
                </div>
              </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
console.log("Patched overview leaders layout");
