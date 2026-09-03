const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const regex = /const myTasks = tasks\.filter\(t => t\.assignedTo === currentUserName && t\.status !== "منجزة" && t\.status !== "مكتمل"\);\s*for \(const t of myTasks\) \{\s*await createGoogleTask\(\{[\s\S]*?\}\);\s*\}/;

const replacement = `const myTasks = tasks.filter(t => t.assignedTo === currentUserName && t.status !== "منجزة" && t.status !== "مكتمل");
                const storedUser = localStorage.getItem("current_user");
                let currentUserEmail = undefined;
                if (storedUser) {
                  currentUserEmail = JSON.parse(storedUser).email;
                }
                for (const t of myTasks) {
                  await createGoogleTask({
                    title: t.title + " (تكليف داخلي)",
                    notes: "الوصف: " + t.description + "\\nالمسند إليه: " + t.assignedTo + "\\nملاحظات: " + (t.additionalNotes || ""),
                    due: t.dueDate ? new Date(t.dueDate).toISOString() : undefined
                  }, currentUserEmail);
                }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
