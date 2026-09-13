const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

// 1. Import updateGoogleTask and createGoogleTask
if (code.includes('createGoogleCalendarEvent')) {
    code = code.replace(/import \{ createGoogleCalendarEvent \} from "\.\.\/lib\/googleApi";/, 'import { createGoogleTask, updateGoogleTask } from "../lib/googleApi";');
}

// 2. Add googleTaskIds to TaskItem interface
if (!code.includes('googleTaskIds?: Record<string, string>;')) {
    code = code.replace(/historyLog\?: Array<[^>]+>;/, 'historyLog?: Array<{ id: string; date: string; time: string; note: string; by: string; action: string }>;\n  googleTaskIds?: Record<string, string>;');
}

// 3. Insert syncTasksToGoogle helper
if (!code.includes('const syncTasksToGoogle = async')) {
    const helper = `
const syncTasksToGoogle = async (tasksList: TaskItem[], dbEmployees: any[]) => {
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
};
`;
    // Find 'export default function CommitteesTasks() {'
    code = code.replace('export default function CommitteesTasks() {', helper + '\nexport default function CommitteesTasks() {');
}

fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
console.log("Updated interface, imports and added sync helper.");
