const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const target = `    // Attempt to find real recommendation in dbRecs to get audit logs and approval stage
    let approvalStage = "أخصائي";
    let auditLogs = [];
    if (selectedAlarm.type === "recommendation") {
        const recIdRaw = String(selectedAlarm.id).replace(/^rec-/, "");
        const matchedRec = dbRecs.find(r => String(r.id) === recIdRaw);
        if (matchedRec) {
            approvalStage = matchedRec.approvalStage || "أخصائي";
            auditLogs = matchedRec.auditLogs || [];
        }
    }`;
                    
const newText = `    // Attempt to find real recommendation in dbRecs to get audit logs and approval stage
    let approvalStage = "أخصائي";
    let auditLogs = [];
    if (selectedAlarm.type === "recommendation") {
        const recIdRaw = String(selectedAlarm.id).replace(/^rec-/, "");
        const matchedRec = dbRecs.find(r => String(r.id) === recIdRaw);
        if (matchedRec) {
            approvalStage = matchedRec.approvalStage || "أخصائي";
            auditLogs = matchedRec.auditLogs || [];
            
            // Override with actual data from dbRecs
            itemDiscussion = matchedRec.recommendationDiscussion || matchedRec.discussion || itemDiscussion;
            recommendationText = matchedRec.recommendationText || matchedRec.description || matchedRec.notes || recommendationText;
            
            // Set specific format for title
            let baseTitle = matchedRec.title || selectedAlarm.title || "";
            if (baseTitle.startsWith("توصية البند:")) {
              baseTitle = baseTitle.replace("توصية البند:", "").trim();
            }
            // If baseTitle is like 'توصية البند الثاني "انتخاب الرئيس"', format it
            if (baseTitle.includes('توصية البند')) {
                // Remove quotes
                baseTitle = baseTitle.replace(/"/g, "").replace('توصية ', 'توصية ').trim();
                itemTitle = \`تفعيل \${baseTitle} لاجتماع \${committeeName} \${meetingSeq}\`;
            } else {
                itemTitle = baseTitle;
            }
        }
    }`;

code = code.replace(target, newText);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched section 5");
