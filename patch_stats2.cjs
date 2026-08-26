const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf-8');

// Also add reports logic to scanSystemRecords
const reportsLogic = `
        const reportsSnap = await getDocs(collection(db, "reports"));
        const reports = reportsSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
        
        reports.forEach((rep: any) => {
            if (isTargetComm(null, "عام") && isWithinDate(rep.date)) { // Reports are usually global or for multiple comms
                items.push({
                    id: rep._id,
                    type: "تقرير",
                    title: rep.title || "تقرير",
                    date: rep.date || "",
                    committee: "عام",
                    status: rep.status || "مكتمل",
                    details: rep.notes || "",
                    category: 'report'
                });
            }
        });
`;

code = code.replace(
    'const tasksSnap = await getDocs(collection(db, "tasks"));',
    'const tasksSnap = await getDocs(collection(db, "tasks"));\n        const reportsSnap = await getDocs(collection(db, "reports"));'
);

code = code.replace(
    'const tasks = tasksSnap.docs.map(d => ({ _id: d.id, ...d.data() }));',
    'const tasks = tasksSnap.docs.map(d => ({ _id: d.id, ...d.data() }));\n        const reports = reportsSnap.docs.map(d => ({ _id: d.id, ...d.data() }));'
);

const tasksLogicFind = `        tasks.forEach((tsk: any) => {
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
        });`;

code = code.replace(tasksLogicFind, tasksLogicFind + `\n\n        reports.forEach((rep: any) => {
            if (isWithinDate(rep.date)) { 
                items.push({
                    id: rep._id,
                    type: "تقرير صادر",
                    title: rep.title || "تقرير دوري",
                    date: rep.date || "",
                    committee: (rep.committees && rep.committees.length > 0) ? rep.committees.join(", ") : "عام",
                    status: rep.status || "مكتمل",
                    details: rep.notes || "",
                    category: 'report'
                });
            }
        });`);

fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
console.log("Patched scan reports");
