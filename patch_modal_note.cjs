const fs = require('fs');
let content = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

content = content.replace(
  /className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-semibold text-left outline-none focus:border-brand" \s*\/>\s*<\/div>\s*<div>\s*<label className="block text-\[11px\] text-gray-500 font-extrabold mb-1\.5">رقم الجوال<\/label>/g,
  'className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-semibold text-left outline-none focus:border-brand" />\n                    <p className="text-[9px] text-gray-400 mt-1 leading-tight">أدخل المفتاح الخاص بك لتفعيل ميزات الذكاء الاصطناعي بحصتك المجانية.</p>\n                  </div>\n                  <div>\n                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">رقم الجوال</label>'
);

fs.writeFileSync('src/pages/OrgChart.tsx', content);
