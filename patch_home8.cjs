const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const target = `                    <div>
                      <span className="text-[10px] text-gray-400 font-black block mb-1">{resolvedDetails.itemNumber} - موضوع التوصية:</span>
                      <p className="text-xs font-extrabold text-blue-900 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                        {resolvedDetails.itemTitle}
                      </p>
                    </div>`;
                    
const newText = `                    <div>
                      <span className="text-[10px] text-gray-400 font-black block mb-1">موضوع البند:</span>
                      <p className="text-xs font-extrabold text-blue-900 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                        {resolvedDetails.itemTitle}
                      </p>
                    </div>`;

code = code.replace(target, newText);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched section 8");
