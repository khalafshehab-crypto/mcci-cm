const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const target = `<h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-brand" />
                    <span>تسجيل مستجدات التوصية وشرح الإفادة ونسبة الإنجاز</span>
                  </h4>`;
                    
const newText = `<h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-brand" />
                    <span>المستجدات (تحديث الحالة والشرح)</span>
                  </h4>`;

code = code.replace(target, newText);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched section 4");
