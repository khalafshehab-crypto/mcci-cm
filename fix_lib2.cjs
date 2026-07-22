const fs = require('fs');
let code = fs.readFileSync('src/pages/Library.tsx', 'utf8');

// The corrupted block starts from 
// </div>rkspaceCenter
// ... until
// <span>زر استيراد وتصدير النماذج الجهازة</span>
// </button>

const regex = /<\/div>rkspaceCenter[\s\S]*?<span>زر استيراد وتصدير النماذج الجهازة<\/span>\s*<\/button>/g;
code = code.replace(regex, '');

fs.writeFileSync('src/pages/Library.tsx', code);
