const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(/<style dangerouslySetInnerHTML=\{\{ __html: \`[\s\S]*?\` \}\} \/>/, '<style dangerouslySetInnerHTML={{ __html: "@media print { body * { visibility: hidden !important; background: white !important; } #printable-meetings-table, #printable-meetings-table * { visibility: visible !important; } #printable-meetings-table { position: absolute; left: 0; top: 0; width: 100% !important; margin: 0 !important; padding: 0 !important; } .print-hidden, .print\\\\:hidden { display: none !important; } }" }} />');

fs.writeFileSync('src/pages/Home.tsx', content);
