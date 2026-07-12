const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const target = `            if (baseTitle.includes('توصية البند')) {
                // Remove quotes
                baseTitle = baseTitle.replace(/"/g, "").replace('توصية ', 'توصية ').trim();
                itemTitle = \\\`تفعيل \\\${baseTitle} لاجتماع \\\${committeeName} \\\${meetingSeq}\\\`;
            } else {
                itemTitle = baseTitle;
            }`;
                    
const newText = `            if (baseTitle.includes('توصية البند')) {
                // Change format from: توصية البند الثاني "انتخاب الرئيس" 
                // To: توصية البند الثاني: انتخاب الرئيس
                baseTitle = baseTitle.replace(/\\s*"(.*?)"\\s*/, ": $1 ");
                baseTitle = baseTitle.replace(/"/g, "").trim(); // clear any remaining quotes
                itemTitle = \`تفعيل \${baseTitle} لاجتماع \${committeeName} \${meetingSeq}\`;
            } else {
                itemTitle = baseTitle;
            }`;

code = code.replace(target, newText);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched section 6");
