const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf-8');

const scanReplacement = `const scanSystemRecords = async (targetCommitteesList: any[], startDateStr: string, endDateStr: string, keywords: string) => {
    const items: any[] = [];
    try {
        const eventsSnap = await getDocs(collection(db, "events"));
        const recsSnap = await getDocs(collection(db, "recommendations"));
        const tasksSnap = await getDocs(collection(db, "tasks"));

        const events = eventsSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
        const recs = recsSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
        const tasks = tasksSnap.docs.map(d => ({ _id: d.id, ...d.data() }));

        const isTargetComm = (commId: any, commName: string) => {
            if (!targetCommitteesList || targetCommitteesList.length === 0) return true;
            return targetCommitteesList.some(c => 
               (c.id && commId && String(c.id) === String(commId)) || 
               (c.name && commName && c.name === commName) ||
               (commName && c.name && commName.includes(c.name))
            );
        };

        const isWithinDate = (dateStr: string) => {
            if (!dateStr) return true;
            try {
                // Parse strings like "YYYY-MM-DD" or similar
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return true; 
                
                // Set hours to 0 to avoid timezone edge cases
                d.setHours(0,0,0,0);
                
                const sd = startDateStr ? new Date(startDateStr) : new Date("2000-01-01");
                sd.setHours(0,0,0,0);
                
                const ed = endDateStr ? new Date(endDateStr) : new Date("2100-01-01");
                ed.setHours(23,59,59,999);
                
                return d >= sd && d <= ed;
            } catch(e) {
                return true;
            }
        };

        events.forEach((evt: any) => {
            if (isTargetComm(evt.committeeId, evt.committeeName) && isWithinDate(evt.date)) {
                items.push({
                    id: evt._id,
                    type: evt.type || "فعالية",
                    title: evt.title || evt.eventName || "بدون عنوان",
                    date: evt.date || "",
                    committee: evt.committeeName || "عام",
                    status: evt.status || "مجدولة",
                    details: evt.notes || evt.location || "",
                    category: 'event'
                });
            }
        });

        recs.forEach((rec: any) => {
            const rDate = rec.date || (rec.createdAt ? rec.createdAt.substring(0,10) : "") || (rec.timestamp ? rec.timestamp.substring(0,10) : "");
            if (isTargetComm(rec.committeeId, rec.committeeName) && isWithinDate(rDate)) {
                items.push({
                    id: rec._id,
                    type: "توصية",
                    title: rec.text || rec.title || "توصية بدون نص",
                    date: rDate,
                    committee: rec.committeeName || "عام",
                    status: rec.status || "جديدة",
                    details: \`المنفذ: \${rec.assignedTo || "غير محدد"}\`,
                    category: 'recommendation'
                });
            }
        });

        tasks.forEach((tsk: any) => {
            const tDate = tsk.dueDate || (tsk.createdAt ? tsk.createdAt.substring(0,10) : "") || (tsk.timestamp ? tsk.timestamp.substring(0,10) : "");
            if (isTargetComm(tsk.committeeId, tsk.committeeName) && isWithinDate(tDate)) {
                items.push({
                    id: tsk._id,
                    type: "مهمة",
                    title: tsk.title || "مهمة",
                    date: tDate,
                    committee: tsk.committeeName || "عام",
                    status: tsk.status || "جديدة",
                    details: tsk.description || "",
                    category: 'task'
                });
            }
        });

        if (keywords) {
           return items.filter(i => 
             (i.title && i.title.includes(keywords)) || 
             (i.details && i.details.includes(keywords)) ||
             (i.committee && i.committee.includes(keywords))
           );
        }

        return items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch(e) {
        console.error("Scan error", e);
        return [];
    }
  };`;

const scanRegex = /const scanSystemRecords = async \(targetCommitteesList: any\[\], startDateStr: string, endDateStr: string, keywords: string\) => \{[\s\S]*?\n  \};\n\n  \/\/ Step 1 -> Step 2:/;
code = code.replace(scanRegex, scanReplacement + "\n\n  // Step 1 -> Step 2:");

// Also update handlePerformSystemSearch to pass [] if 'all'
const targetCommsRegex = /const targetComms = wizReportScope === "all"\s*\?\s*committees\s*:\s*committees\.filter\(c => wizSelectedCommittees\.includes\(String\(c\.id\)\)\);/;
code = code.replace(targetCommsRegex, `const targetComms = wizReportScope === "all" ? [] : committees.filter(c => wizSelectedCommittees.includes(String(c.id)));`);


fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
console.log("Patched scanSystemRecords 3");
