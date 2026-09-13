const fs = require('fs');
let code = fs.readFileSync('src/lib/workspaceSync.ts', 'utf8');

const targetStr = `    const tasksSnap = await getDocs(collection(db, "tasks"));
    const myTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter((t: any) => (t.assignedToId === currentUser.id || t.assignedTo === currentUser.name) && !t.googleTaskId);
    if (myTasks.length > 0) {
      const listsRes = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      if (listsRes.ok) {
        const listsData = await listsRes.json();
        const defaultList = listsData.items?.[0]?.id;
        if (defaultList) {
          for (const task of myTasks) {
            const taskBody = {
              title: task.title || task.content || "مهمة إدارية",
              notes: \`تم إنشاؤها من بوابة اللجان القطاعية.\\n\${task.content || ""}\`,
              due: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
            };
            const createRes = await fetch(\`https://tasks.googleapis.com/tasks/v1/lists/\${defaultList}/tasks\`, {
              method: 'POST',
              headers: { 
                Authorization: \`Bearer \${token}\`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(taskBody)
            });
            if (createRes.ok) {
              const createdTask = await createRes.json();
              try {
                await updateDoc(doc(db, "tasks", task.id), { googleTaskId: createdTask.id });
              } catch (e) {
                console.error("Workspace Sync Error updating task", task.id, e);
              }
            }
          }
        }
      }
    }`;

code = code.replace(targetStr, `    // Task syncing is now handled directly via createGoogleTask/updateGoogleTask with rich details.`);

fs.writeFileSync('src/lib/workspaceSync.ts', code);
console.log("Fixed workspaceSync.ts");
