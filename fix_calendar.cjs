const fs = require('fs');
let code = fs.readFileSync('src/components/GoogleWorkspaceCenter.tsx', 'utf8');

const oldCode = `      await createCalendarEvent({
        title: \`مهمة: \${taskTitle}\`,
        description: taskNotes,
        start: { date: dueIso ? dueIso.split('T')[0] : new Date().toISOString().split('T')[0] },
        end: { date: dueIso ? dueIso.split('T')[0] : new Date().toISOString().split('T')[0] }
      });`;
const newCode = `      await createCalendarEvent({
        title: \`مهمة: \${taskTitle}\`,
        description: taskNotes,
        startTime: dueIso || new Date().toISOString(),
        endTime: dueIso || new Date().toISOString()
      });`;
code = code.replace(oldCode, newCode);

fs.writeFileSync('src/components/GoogleWorkspaceCenter.tsx', code);
console.log("Fixed CalendarEventPayload");
