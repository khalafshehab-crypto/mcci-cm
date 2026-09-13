const fs = require('fs');
let c = fs.readFileSync('src/lib/workspaceSync.ts', 'utf8');

c = c.replace(/try \{/g, `try {`);
c = c.replace(/console\.error\("Workspace Sync Error. Failed operation context:", error\);/g, `console.error("Workspace Sync Error:", error);`);

c = `
import { getSharedAccessToken } from "./googleApi";
import { doc, updateDoc, getDocs, collection } from "./firebase";
import { db } from "./firebase";
import { Employee } from "../pages/OrgChart";

export async function syncUserWorkspace(currentUser: Employee) {
  const { auth } = await import("./firebase");
  if (!auth || !auth.currentUser) return;
  if (!db || db.type === "dummy_firestore") return;
  const token = await getSharedAccessToken();
  if (!token) return;

  try {
    const tasksSnap = await getDocs(collection(db, "tasks"));
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
    }

    const eventCollections = ["events", "centers_events", "assistant_sec_gen_events", "affiliates_events"];
    for (const collName of eventCollections) {
      const eventsSnap = await getDocs(collection(db, collName));
      const myEvents = eventsSnap.docs.map(d => ({ id: d.id, collName, ...d.data() }))
        .filter((e: any) => (e.specialistId === currentUser.id || e.specialistName === currentUser.name) && !e.googleEventId);

      if (myEvents.length > 0) {
        for (const ev of myEvents) {
          let startDateTime = new Date();
          let endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
          if (ev.date) {
             const [year, month, day] = ev.date.split("-").map(Number);
             const [hours, minutes] = ev.time ? ev.time.split(":").map(Number) : [9, 0];
             startDateTime = new Date(year, month - 1, day, hours, minutes);
             endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
          }
          const eventBody = {
            summary: ev.title || "فعالية من بوابة اللجان",
            description: \`النوع: \${ev.type || ""}\\nاللجنة: \${ev.committeeName || ""}\\nالأولوية: \${ev.priority || ""}\`,
            location: ev.location || "",
            start: { dateTime: startDateTime.toISOString(), timeZone: "Asia/Riyadh" },
            end: { dateTime: endDateTime.toISOString(), timeZone: "Asia/Riyadh" }
          };
          const createRes = await fetch(\`https://www.googleapis.com/calendar/v3/calendars/primary/events\`, {
            method: 'POST',
            headers: {
              Authorization: \`Bearer \${token}\`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventBody)
          });
          if (createRes.ok) {
             const createdEvent = await createRes.json();
             try {
                await updateDoc(doc(db, collName, ev.id), { googleEventId: createdEvent.id });
             } catch (e) {
                console.error("Workspace Sync Error updating event", collName, ev.id, e);
             }
          }
        }
      }
    }
  } catch (error) {
    console.error("Workspace Sync Error:", error);
  }
}
`;
fs.writeFileSync('src/lib/workspaceSync.ts', c);
