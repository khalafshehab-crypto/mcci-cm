const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// I will find title={`انتقل مباشرة إلى خطوة: ${displayText}
// and replace it with title={`انتقل مباشرة إلى خطوة: ${displayText}`}

content = content.replace(/title=\{\`انتقل مباشرة إلى خطوة: \$\{displayText\}\s*>/, 'title={`انتقل مباشرة إلى خطوة: ${displayText}`}\n                                  >');

fs.writeFileSync('src/pages/Home.tsx', content);
