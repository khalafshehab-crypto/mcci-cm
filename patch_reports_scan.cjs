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
               (c.name && commName && c.name === commName)
            );
        };

        const isWithinDate = (dateStr: string) => {
            if (!dateStr) return true;
            try {
                // If date is like DD/MM/YYYY, try to handle it roughly or just let Date parse it
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return true; // If invalid date, just include it
                const sd = startDateStr ? new Date(startDateStr) : new Date("2000-01-01");
                const ed = endDateStr ? new Date(endDateStr) : new Date("2100-01-01");
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
            if (isTargetComm(rec.committeeId, rec.committeeName) && isWithinDate(rec.date || rec.createdAt?.substring(0,10) || rec.timestamp?.substring(0,10))) {
                items.push({
                    id: rec._id,
                    type: "توصية",
                    title: rec.text || rec.title || "توصية بدون نص",
                    date: rec.date || rec.createdAt?.substring(0,10) || rec.timestamp?.substring(0,10) || "",
                    committee: rec.committeeName || "عام",
                    status: rec.status || "جديدة",
                    details: \`المنفذ: \${rec.assignedTo || "غير محدد"}\`,
                    category: 'recommendation'
                });
            }
        });

        tasks.forEach((tsk: any) => {
            if (isTargetComm(tsk.committeeId, tsk.committeeName) && isWithinDate(tsk.dueDate || tsk.createdAt?.substring(0,10) || tsk.timestamp?.substring(0,10))) {
                items.push({
                    id: tsk._id,
                    type: "مهمة",
                    title: tsk.title || "مهمة",
                    date: tsk.dueDate || tsk.createdAt?.substring(0,10) || tsk.timestamp?.substring(0,10) || "",
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

        return items;
    } catch(e) {
        console.error("Scan error", e);
        return [];
    }
  };`;

const scanRegex = /const scanSystemRecords = async \(targetCommitteesList: any\[\], startDateStr: string, endDateStr: string, keywords: string\) => \{[\s\S]*?\n  \};\n\n  \/\/ Step 1 -> Step 2:/;
code = code.replace(scanRegex, scanReplacement + "\n\n  // Step 1 -> Step 2:");

fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
console.log("Patched scanSystemRecords again");
