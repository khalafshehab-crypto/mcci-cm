const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const target = `                      {/* Member Attachments */}
                      {(m.cv || m.commercialRegister || m.membershipCertificate || m.authorization) && (
                        <div className="pt-2 border-t border-gray-100">
                          <span className="text-[10px] font-black text-gray-400 mb-2 block">مرفقات العضو</span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: "السيرة الذاتية", value: m.cv },
                              { label: "السجل التجاري", value: m.commercialRegister },
                              { label: "الاشتراك", value: m.membershipCertificate },
                              { label: "التفويض", value: m.authorization }
                            ].map((doc, idx) => doc.value ? (
                              <div key={idx} className="flex items-center gap-1.5 p-1.5 px-2 bg-gray-50 rounded-lg border border-gray-100">
                                <Paperclip className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] font-bold text-gray-700">{doc.label}</span>
                                <a 
                                  href={typeof doc.value === 'string' && doc.value.startsWith('http') ? doc.value : '#'}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm mr-1"
                                  title="عرض المرفق"
                                  onClick={(e) => {
                                    if (typeof doc.value === 'string' && !doc.value.startsWith('http')) {
                                      e.preventDefault();
                                      alert('المرفق محلي وغير متوفر كرابط.');
                                    }
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                </a>
                              </div>
                            ) : null)}
                          </div>
                        </div>
                      )}`;

const replacement = `                      {/* Member Attachments */}
                      {(m.cv || m.commercialRegister || m.membershipCertificate || m.authorization) && (
                        <div className="pt-2 border-t border-gray-100">
                          <span className="text-[10px] font-black text-gray-400 mb-2 block text-right">مرفقات العضو</span>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: "السيرة الذاتية", value: m.cv },
                              { label: "السجل التجاري", value: m.commercialRegister },
                              { label: "الاشتراك", value: m.membershipCertificate },
                              { label: "التفويض", value: m.authorization }
                            ].map((doc, idx) => doc.value ? (
                              <div key={idx} className="flex flex-col items-center justify-center gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  <Paperclip className="w-3.5 h-3.5 text-blue-500 mb-0.5" />
                                  <span className="text-[9px] font-bold text-gray-700">{doc.label}</span>
                                </div>
                                <a 
                                  href={typeof doc.value === 'string' && doc.value.startsWith('http') ? doc.value : '#'}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                                  title="عرض المرفق"
                                  onClick={(e) => {
                                    if (typeof doc.value === 'string' && !doc.value.startsWith('http')) {
                                      e.preventDefault();
                                      alert('المرفق محلي وغير متوفر كرابط.');
                                    }
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                  <span className="text-[9px] font-black">عرض</span>
                                </a>
                              </div>
                            ) : null)}
                          </div>
                        </div>
                      )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
console.log("Patched member attachments layout");
