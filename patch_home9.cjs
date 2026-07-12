const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const target = `                itemTitle = \`تفعيل \${baseTitle} لاجتماع \${committeeName} \${meetingSeq}\`;`;
                    
const newText = `                let seqStr = meetingSeq.replace("الاجتماع ", "");
                itemTitle = \`تفعيل \${baseTitle} لاجتماع \${committeeName} \${seqStr}\`;`;

code = code.replace(target, newText);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched section 9");
