const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// I will find the exact block and replace it
content = content.replace(/<style dangerouslySetInnerHTML=\{\{ __html: \`\s*\@media print \{\s*body \* \{ visibility: hidden !important; background: white !important; \}\s*\#printable-meetings-table, \#printable-meetings-table \* \{ visibility: visible !important; \}\s*\#printable-meetings-table \{ position: absolute; left: 0; top: 0; width: 100% !important; margin: 0 !important; padding: 0 !important; \}\s*\.print-hidden, \.print\\\\:hidden \{ display: none !important; \}\s*\}\s*([^>]+)>/, '<style dangerouslySetInnerHTML={{ __html: `\n        @media print {\n          body * { visibility: hidden !important; background: white !important; }\n          #printable-meetings-table, #printable-meetings-table * { visibility: visible !important; }\n          #printable-meetings-table { position: absolute; left: 0; top: 0; width: 100% !important; margin: 0 !important; padding: 0 !important; }\n          .print-hidden, .print\\\\:hidden { display: none !important; }\n        }\n      ` }} />');

fs.writeFileSync('src/pages/Home.tsx', content);
