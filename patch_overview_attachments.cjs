const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const target = `              </div>
            </div>
          )}

          {activeTab === "members" && (`;

const replacement = `              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h5 className="text-xs font-black text-gray-500 border-b border-gray-100 pb-2">مرفقات اللجنة</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "قرار التشكيل", value: detailsComm.formationLetter },
                    { label: "اعتماد الأعضاء", value: detailsComm.membersApproval },
                    { label: "اللوائح", value: detailsComm.regulations },
                    { label: "الأدلة", value: detailsComm.guides }
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-gray-700">{doc.label}</span>
                      </div>
                      {doc.value ? (
                        <a 
                          href={typeof doc.value === 'string' && doc.value.startsWith('http') ? doc.value : '#'}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                          title="عرض المرفق"
                          onClick={(e) => {
                            if (typeof doc.value === 'string' && !doc.value.startsWith('http')) {
                              e.preventDefault();
                              alert('المرفق محلي وغير متوفر كرابط.');
                            }
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">غير متوفر</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
console.log("Patched overview attachments");
