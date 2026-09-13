const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const oldForwardSubmit = `        await updateDoc(doc(db, colName, currentTask.id), {
          assignedTo: forwardAssignTo,
          historyLog: updatedHistory
        });
        setIsSendOpen(false);`;

const newForwardSubmit = `        await updateDoc(doc(db, colName, currentTask.id), {
          assignedTo: forwardAssignTo,
          historyLog: updatedHistory
        });

        try {
           await syncTasksToGoogle([{...currentTask, assignedTo: forwardAssignTo} as TaskItem], allEmployeesData);
        } catch (err) {
           console.warn("Failed to sync forwarded task to Google Tasks", err);
        }
        
        setIsSendOpen(false);`;

if(code.includes(oldForwardSubmit)) {
    code = code.replace(oldForwardSubmit, newForwardSubmit);
    fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
    console.log("Fixed forward submit in CommitteesTasks");
} else {
    console.log("Could not find forward submit in CommitteesTasks");
}
