const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const target = `            // If baseTitle is like 'توصية البند الثاني "انتخاب الرئيس"', format it
            if (baseTitle.includes('توصية البند')) {
                // Remove quotes
                baseTitle = baseTitle.replace(/"/g, "").replace('توصية ', 'توصية ').trim();
                let seqStr = meetingSeq.replace("الاجتماع ", "");
                itemTitle = \`تفعيل \${baseTitle} لاجتماع \${committeeName} \${seqStr}\`;
            } else {
                itemTitle = baseTitle;
            }`;
            
const newText = `            // If baseTitle is like 'توصية البند الثاني "انتخاب الرئيس"', format it
            if (baseTitle.includes('توصية البند')) {
                // Convert quotes into colon
                baseTitle = baseTitle.replace(/\\s*"(.*?)"\\s*/g, ": $1 ").trim();
                let seqStr = meetingSeq;
                if (seqStr.includes("التأسيسي")) {
                    seqStr = seqStr.replace("الاجتماع التأسيسي (الأول)", "الدوري الأول (التأسيسي)");
                }
                itemTitle = \`تفعيل \${baseTitle} لاجتماع \${committeeName} \${seqStr}\`;
            } else {
                itemTitle = baseTitle;
            }`;

code = code.replace(target, newText);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched section 10");
