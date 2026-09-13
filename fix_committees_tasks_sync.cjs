const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

// Replace Add Task sync logic
const addDocOriginal = `      await addDoc(collection(db, "tasks"), newTask);
      
      // Sync to Google Tasks
      try {
        const targetEmp = allEmployeesData.find(e => e.name === assignedTo);
        const empEmail = targetEmp ? targetEmp.email : undefined;
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
        showGlobalToast("تم إنشاء المهمة ومزامنتها مع Google Calendar", "success");
      } catch (err) {
        console.warn("Failed to sync with Google Calendar", err);
        showGlobalToast("تم الحفظ في النظام، ولكن فشلت المزامنة مع Google Calendar", "error");
      }`;

const addDocReplacement = `      const docRef = await addDoc(collection(db, "tasks"), newTask);
      
      // Sync to Google Tasks
      try {
        const stats = await syncTasksToGoogle([{...newTask, id: docRef.id} as TaskItem], allEmployeesData);
        if (stats.failed > 0) {
            showGlobalToast("تم الحفظ، لكن فشلت المزامنة مع Google Tasks", "error");
        } else {
            showGlobalToast("تم إنشاء المهمة ومزامنتها مع Google Tasks", "success");
        }
      } catch (err) {
        console.warn("Failed to sync with Google Tasks", err);
        showGlobalToast("تم الحفظ في النظام، ولكن فشلت المزامنة مع Google Tasks", "error");
      }`;

code = code.replace(addDocOriginal, addDocReplacement);

// Replace Edit Task sync logic
const updateDocOriginal = `      await updateDoc(doc(db, "tasks", currentTask.id), {
        title,
        description,
        sourceType,
        sourceDetails,
        additionalNotes,
        priority,
        dueDate,
        assignedBy,
        assignedTo,
        status: calculatedStatus,
        achievementNotes,
        attachments: tempAttachments
      });
      setIsEditOpen(false);`;

const updateDocReplacement = `      const updatedData = {
        title,
        description,
        sourceType,
        sourceDetails,
        additionalNotes,
        priority,
        dueDate,
        assignedBy,
        assignedTo,
        status: calculatedStatus,
        achievementNotes,
        attachments: tempAttachments
      };
      await updateDoc(doc(db, "tasks", currentTask.id), updatedData);
      
      try {
         await syncTasksToGoogle([{...currentTask, ...updatedData} as TaskItem], allEmployeesData);
      } catch (err) {
         console.warn("Failed to sync updated task to Google Tasks", err);
      }

      setIsEditOpen(false);`;
code = code.replace(updateDocOriginal, updateDocReplacement);

// Replace Manual Sync logic
const manualSyncOriginal = `                const myTasks = tasks.filter(t => t.assignedTo === currentUserName && t.status !== "منجزة" && t.status !== "مكتمل");
                const storedUser = localStorage.getItem("current_user");
                let currentUserEmail = undefined;
                if (storedUser) {
                  currentUserEmail = JSON.parse(storedUser).email;
                }
                for (const t of myTasks) {
                  await createGoogleCalendarEvent({
                    summary: t.title + " (تكليف داخلي)",
                    description: "الوصف: " + t.description + "\\nالمسند إليه: " + t.assignedTo + "\\nملاحظات: " + (t.additionalNotes || ""),
                    start: { date: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] },
                    end: { date: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] }
                  }, currentUserEmail);
                }
                showGlobalToast("تم مزامنة " + myTasks.length + " مهام مع حسابك بنجاح", "success");`;

const manualSyncReplacement = `                const myTasks = tasks.filter(t => t.assignedTo === currentUserName && t.status !== "منجزة" && t.status !== "مكتمل");
                const stats = await syncTasksToGoogle(myTasks, allEmployeesData);
                
                if (stats.failed > 0 && stats.created === 0 && stats.updated === 0) {
                    showGlobalToast("فشلت المزامنة، يرجى التأكد من الصلاحيات", "error");
                } else {
                    showGlobalToast(\`تم مزامنة المهام بنجاح (جديدة: \${stats.created}, محدثة: \${stats.updated})\`, "success");
                }`;
code = code.replace(manualSyncOriginal, manualSyncReplacement);

// Replace Calendar error message
code = code.replace(`showGlobalToast("فشلت المزامنة، يرجى التأكد من صلاحيات Google Calendar", "error");`, `showGlobalToast("فشلت المزامنة، يرجى التأكد من صلاحيات حسابك لـ Google Tasks", "error");`);

fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
console.log("Updated add/edit/manual sync logic");
