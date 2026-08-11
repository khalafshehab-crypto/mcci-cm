const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const target = `                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
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
                    </div>`;

const replacement = `                    <div key={idx} className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Paperclip className="w-4 h-4 text-blue-500 mb-1" />
                        <span className="text-xs font-bold text-gray-700">{doc.label}</span>
                      </div>
                      {doc.value ? (
                        <a 
                          href={typeof doc.value === 'string' && doc.value.startsWith('http') ? doc.value : '#'}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                          title="عرض المرفق"
                          onClick={(e) => {
                            if (typeof doc.value === 'string' && !doc.value.startsWith('http')) {
                              e.preventDefault();
                              alert('المرفق محلي وغير متوفر كرابط.');
                            }
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black">عرض</span>
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md mt-0.5">غير متوفر</span>
                      )}
                    </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
console.log("Patched overview attachments layout");
