const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const originalAddSubmit = `      await addDoc(collection(db, "tasks"), newTask);
      
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

const replacementAddSubmit = `      const docRef = await addDoc(collection(db, "tasks"), newTask);
      
      // Sync to Google Tasks & Calendar
      try {
        const targetEmp = allEmployeesData.find(e => e.name === assignedTo);
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
      }`;

if(code.includes(originalAddSubmit)) {
    code = code.replace(originalAddSubmit, replacementAddSubmit);
    fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
    console.log("Fixed handleAddSubmit in CommitteesTasks");
} else {
    console.log("Could not find originalAddSubmit");
}
