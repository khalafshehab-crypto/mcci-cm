const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const target = `    if (itemTitle.startsWith("توصية البند:")) {
      itemTitle = itemTitle.replace("توصية البند:", "").trim();
    }
    
    return {
      committeeName,
      meetingSeq,
      meetingDate,
      staffName,
      itemNumber,
      itemTitle,
      itemDiscussion,
      recommendationText
    };
  }, [selectedAlarm, dbEvents]);`;

const newText = `    if (itemTitle.startsWith("توصية البند:")) {
      itemTitle = itemTitle.replace("توصية البند:", "").trim();
    }
    
    // Attempt to find real recommendation in dbRecs to get audit logs and approval stage
    let approvalStage = "أخصائي";
    let auditLogs = [];
    if (selectedAlarm.type === "recommendation") {
        const recIdRaw = String(selectedAlarm.id).replace(/^rec-/, "");
        const matchedRec = dbRecs.find(r => String(r.id) === recIdRaw);
        if (matchedRec) {
            approvalStage = matchedRec.approvalStage || "أخصائي";
            auditLogs = matchedRec.auditLogs || [];
        }
    }
    
    return {
      committeeName,
      meetingSeq,
      meetingDate,
      staffName,
      itemNumber,
      itemTitle,
      itemDiscussion,
      recommendationText,
      approvalStage,
      auditLogs
    };
  }, [selectedAlarm, dbEvents, dbRecs]);`;

code = code.replace(target, newText);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Patched resolvedDetails");
