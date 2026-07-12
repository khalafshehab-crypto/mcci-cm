const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const target = `                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <UserCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-black block">الأخصائي المسؤول</span>
                        <span className="text-xs font-bold text-gray-900">{resolvedDetails.staffName}</span>
                      </div>
                    </div>`;
                    
const newText = `                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <UserCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-black block">مرحلة الاعتماد</span>
                        <span className="text-xs font-bold text-gray-900">{resolvedDetails.approvalStage}</span>
                      </div>
                    </div>`;

code = code.replace(target, newText);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched section 1");
