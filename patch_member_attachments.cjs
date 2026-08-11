const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const target = `                  {commMembers.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {m.personalPhoto ? <img src={m.personalPhoto} className="w-full h-full object-cover" /> : <UserCheck className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-brand font-black block">{m.role}</span>
                        <span className="text-xs font-extrabold text-gray-800">{m.title} {m.name}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{m.phone}</span>
                      </div>
                    </div>
                  ))}`;

const replacement = `                  {commMembers.map((m: any) => (
                    <div key={m.id} className="flex flex-col gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {m.personalPhoto ? <img src={m.personalPhoto} className="w-full h-full object-cover" /> : <UserCheck className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-brand font-black block">{m.role}</span>
                          <span className="text-xs font-extrabold text-gray-800">{m.title} {m.name}</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{m.phone}</span>
                        </div>
                      </div>

                      {/* Member Attachments */}
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
                      )}
                    </div>
                  ))}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
console.log("Patched member attachments");
