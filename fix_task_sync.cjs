const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const oldSyncFn = `const syncTasksToGoogle = async (tasksList: TaskItem[], dbEmployees: any[]) => {
    let stats = { created: 0, updated: 0, failed: 0 };
    for (const t of tasksList) {
        if (!t.assignedTo) continue;
        let updatedGoogleTaskIds = { ...(t.googleTaskIds || {}) };
        
        const targetEmp = dbEmployees.find((e: any) => e.name === t.assignedTo);
        if (targetEmp && targetEmp.email) {
            let taskPayload = {
               title: \`\${t.title} (تكليف داخلي)\`,
               notes: \`الوصف: \${t.description}\\nالمنسق: \${t.assignedBy}\\nملاحظات: \${t.additionalNotes || ""}\`,
               due: t.dueDate ? new Date(t.dueDate).toISOString() : undefined,
            };
            try {
                if (updatedGoogleTaskIds[t.assignedTo]) {
                    try {
                       await updateGoogleTask(updatedGoogleTaskIds[t.assignedTo], taskPayload, targetEmp.email);
                       stats.updated++;
                    } catch(err) {
                       const res = await createGoogleTask(taskPayload, targetEmp.email);
                       if (res && res.id) {
                          updatedGoogleTaskIds[t.assignedTo] = res.id;
                          stats.updated++;
                       }
                    }
                } else {
                    const res = await createGoogleTask(taskPayload, targetEmp.email);
                    if (res && res.id) {
                        updatedGoogleTaskIds[t.assignedTo] = res.id;
                        stats.created++;
                    }
                }
                
                if (JSON.stringify(updatedGoogleTaskIds) !== JSON.stringify(t.googleTaskIds || {})) {
                    await updateDoc(doc(db, "tasks", t.id), { googleTaskIds: updatedGoogleTaskIds });
                }
            } catch (err) {
                console.warn("Failed to sync task", t.id, err);
                stats.failed++;
            }
        }
    }
    return stats;
};`;

const newSyncFn = `const syncTasksToGoogle = async (tasksList: TaskItem[], dbEmployees: any[]) => {
    let stats = { created: 0, updated: 0, failed: 0 };
    for (const t of tasksList) {
        if (!t.assignedTo) continue;
        let updatedGoogleTaskIds = { ...(t.googleTaskIds || {}) };
        
        // Clean up old assignments
        const keys = Object.keys(updatedGoogleTaskIds);
        for (const oldAssignee of keys) {
            if (oldAssignee !== t.assignedTo) {
                const oldEmp = dbEmployees.find((e: any) => e.name === oldAssignee);
                if (oldEmp && oldEmp.email) {
                    try {
                        await deleteGoogleTask(updatedGoogleTaskIds[oldAssignee], oldEmp.email);
                    } catch(e) {
                        console.warn("Failed to delete old task for", oldAssignee);
                    }
                }
                delete updatedGoogleTaskIds[oldAssignee];
            }
        }
        
        const targetEmp = dbEmployees.find((e: any) => e.name === t.assignedTo);
        if (targetEmp && targetEmp.email) {
            let taskPayload = {
               title: \`\${t.title} (تكليف داخلي)\`,
               notes: \`الوصف: \${t.description}\\nالمنسق: \${t.assignedBy}\\nملاحظات: \${t.additionalNotes || ""}\`,
               due: t.dueDate ? new Date(t.dueDate).toISOString() : undefined,
            };
            try {
                if (updatedGoogleTaskIds[t.assignedTo]) {
                    try {
                       await updateGoogleTask(updatedGoogleTaskIds[t.assignedTo], taskPayload, targetEmp.email);
                       stats.updated++;
                    } catch(err) {
                       const res = await createGoogleTask(taskPayload, targetEmp.email);
                       if (res && res.id) {
                          updatedGoogleTaskIds[t.assignedTo] = res.id;
                          stats.updated++;
                       }
                    }
                } else {
                    const res = await createGoogleTask(taskPayload, targetEmp.email);
                    if (res && res.id) {
                        updatedGoogleTaskIds[t.assignedTo] = res.id;
                        stats.created++;
                    }
                }
                
                if (JSON.stringify(updatedGoogleTaskIds) !== JSON.stringify(t.googleTaskIds || {})) {
                    await updateDoc(doc(db, "tasks", t.id), { googleTaskIds: updatedGoogleTaskIds });
                }
            } catch (err) {
                console.warn("Failed to sync task", t.id, err);
                stats.failed++;
            }
        } else {
             // Target employee has no email, but we might have deleted old ones
             if (JSON.stringify(updatedGoogleTaskIds) !== JSON.stringify(t.googleTaskIds || {})) {
                 await updateDoc(doc(db, "tasks", t.id), { googleTaskIds: updatedGoogleTaskIds });
             }
        }
    }
    return stats;
};`;

if(code.includes(oldSyncFn)) {
    code = code.replace(oldSyncFn, newSyncFn);
    fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
    console.log("Fixed syncTasksToGoogle");
} else {
    console.log("Could not find syncTasksToGoogle");
}
