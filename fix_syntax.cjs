const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// The line is: ملاحظة هامة: أخرج الخطاب فقط بدون أي شروحات إضافية وبدون استخدام علامات Markdown مثل ``` ، فقط النص الجاهز الصافي للخطاب.
// If it has ``` in the template string, it ends the string!
content = content.replace(/Markdown مثل ``` ،/g, "Markdown مثل ''' ،");

fs.writeFileSync('server.ts', content);
