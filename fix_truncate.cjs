const fs = require('fs');

const file = '/app/applet/src/components/Layout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div className="block text-right pr-2">/,
  '<div className="block text-right pr-2 overflow-hidden">'
);

content = content.replace(
  /<h1 className="text-\[13px\] font-black text-gray-900 leading-tight">/,
  '<h1 className="text-[12px] sm:text-[13px] font-black text-gray-900 leading-tight truncate max-w-[140px] sm:max-w-none">'
);

content = content.replace(
  /<p className="text-\[10px\] font-bold text-gray-500 mt-0\.5 flex items-center gap-1">/,
  '<p className="text-[9px] sm:text-[10px] font-bold text-gray-500 mt-0.5 flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">'
);

fs.writeFileSync(file, content);
console.log('Fixed truncation in Layout.tsx');
