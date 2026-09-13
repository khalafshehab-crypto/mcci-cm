const fs = require('fs');
let code = fs.readFileSync('src/pages/Tasks.tsx', 'utf8');

// 1. add imports
if (!code.includes("createGoogleTask")) {
    const importStr = `import { createGoogleTask, updateGoogleTask, deleteGoogleTask, createGoogleCalendarEvent } from "../lib/googleApi";\nimport { showGlobalToast } from "../components/toastUtils";\n`;
    code = code.replace(`import { db } from '../lib/firebase';`, `import { db } from '../lib/firebase';\n${importStr}`);
}

// 2. Add googleTaskIds to TaskItem interface
if (!code.includes("googleTaskIds?: Record<string, string>;")) {
    code = code.replace(`  historyLog?: Array<{ id: string; date: string; time: string; note: string; by: string; action: string }>;\n}`, `  historyLog?: Array<{ id: string; date: string; time: string; note: string; by: string; action: string }>;\n  googleTaskIds?: Record<string, string>;\n}`);
}

// 3. Add syncTasksToGoogle function BEFORE default export
const syncFnStr = `
const syncTasksToGoogle = async (tasksList: TaskItem[], dbEmployees: any[]) => {
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
             if (JSON.stringify(updatedGoogleTaskIds) !== JSON.stringify(t.googleTaskIds || {})) {
                 await updateDoc(doc(db, "tasks", t.id), { googleTaskIds: updatedGoogleTaskIds });
             }
        }
    }
    return stats;
};
`;
if (!code.includes("const syncTasksToGoogle")) {
    code = code.replace(`export default function Tasks() {`, `${syncFnStr}\nexport default function Tasks() {`);
}

// 4. Update handleAddSubmit
const oldAddSubmit = `      await addDoc(collection(db, "tasks"), newTask);
      setIsAddOpen(false);`;

const newAddSubmit = `      const docRef = await addDoc(collection(db, "tasks"), newTask);
      
      // Sync to Google Tasks & Calendar
      try {
        const targetEmp = allEmployeesData.find((e: any) => e.name === assignedTo);
        const empEmail = targetEmp ? targetEmp.email : undefined;
        
        let createdTaskId;
        try {
            const res = await createGoogleTask({
               title: \`\${title} (تكليف داخلي)\`,
               notes: \`الوصف: \${description}\\nالمنسق: \${assignedBy}\\nملاحظات: \${additionalNotes || ""}\`,
               due: dueDate ? new Date(dueDate).toISOString() : undefined,
            }, empEmail);
            if (res && res.id) {
               createdTaskId = res.id;
               await updateDoc(doc(db, "tasks", docRef.id), { 
                   googleTaskIds: { [assignedTo]: res.id }
               });
            }
        } catch(e) {
            console.warn("Failed to create Google Task", e);
        }

        await createGoogleCalendarEvent({
          summary: \`\${title} (تكليف داخلي)\`,
          description: \`الوصف: \${description}\\nالمسند إليه: \${assignedTo}\\nملاحظات: \${additionalNotes}\`,
          start: {
            date: dueDate ? new Date(dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          },
          end: {
            date: dueDate ? new Date(dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          }
        }, empEmail);
        showGlobalToast("تم إنشاء المهمة ومزامنتها مع المهام والتقويم", "success");
      } catch (err) {
        console.warn("Failed to sync with Google APIs", err);
        showGlobalToast("تم الحفظ، ولكن واجهنا مشكلة في المزامنة", "error");
      }
      setIsAddOpen(false);`;
code = code.replace(oldAddSubmit, newAddSubmit);


// 5. Update handleEditSubmit
const oldEditSubmit = `      await updateDoc(doc(db, "tasks", currentTask.id), updatedData);
      
      setIsEditOpen(false);`;
const newEditSubmit = `      await updateDoc(doc(db, "tasks", currentTask.id), updatedData);
      
      try {
         await syncTasksToGoogle([{...currentTask, ...updatedData} as TaskItem], allEmployeesData);
      } catch (err) {
         console.warn("Failed to sync updated task to Google Tasks", err);
      }

      setIsEditOpen(false);`;
code = code.replace(oldEditSubmit, newEditSubmit);


// 6. Update handleActionSubmit (forwarding to another assignee)
// Wait, is handleActionSubmit the one doing forward? No, handleActionSubmit is status change.
// The forward is in handleForwardSubmit. Let's see if it exists in Tasks.tsx
const oldForwardSubmit = `        await updateDoc(doc(db, "tasks", currentTask.id), {
          assignedTo: forwardAssignTo,
          historyLog: updatedHistory
        });
        setIsSendOpen(false);`;

const newForwardSubmit = `        await updateDoc(doc(db, "tasks", currentTask.id), {
          assignedTo: forwardAssignTo,
          historyLog: updatedHistory
        });
        
        try {
           await syncTasksToGoogle([{...currentTask, assignedTo: forwardAssignTo} as TaskItem], allEmployeesData);
        } catch (err) {}
        
        setIsSendOpen(false);`;
if(code.includes(oldForwardSubmit)) {
    code = code.replace(oldForwardSubmit, newForwardSubmit);
}

// 7. Update handleDeleteTask
const oldDeleteFn = `      localStorage.setItem("app_system_logs", JSON.stringify([logEntry, ...currentLogs]));
      
      await deleteDoc(doc(db, "tasks", taskToDeleteId));`;

const newDeleteFn = `      localStorage.setItem("app_system_logs", JSON.stringify([logEntry, ...currentLogs]));
      
      if (deletedItem && deletedItem.googleTaskIds) {
          const keys = Object.keys(deletedItem.googleTaskIds);
          for (const key of keys) {
              const emp = allEmployeesData.find(e => e.name === key);
              if (emp && emp.email) {
                  try {
                      await deleteGoogleTask(deletedItem.googleTaskIds[key], emp.email);
                  } catch(e) {
                      console.warn("Failed to delete task from Google Tasks", e);
                  }
              }
          }
      }

      await deleteDoc(doc(db, "tasks", taskToDeleteId));`;
if (code.includes(oldDeleteFn)) {
    code = code.replace(oldDeleteFn, newDeleteFn);
}


fs.writeFileSync('src/pages/Tasks.tsx', code);
console.log("Tasks.tsx updated successfully");

