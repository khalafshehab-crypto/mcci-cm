const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

code = code.replace(/import \{ createGoogleTask \} from "\.\.\/lib\/googleApi";/, 'import { createGoogleCalendarEvent } from "../lib/googleApi";');

// Replace new task creation call
code = code.replace(/await createGoogleTask\(\{[\s\S]*?\}, empEmail\);/, 
`await createGoogleCalendarEvent({
          summary: \`\${title} (تكليف داخلي)\`,
          description: \`الوصف: \${description}\\nالمسند إليه: \${assignedTo}\\nملاحظات: \${additionalNotes}\`,
          start: {
            date: dueDate ? new Date(dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          },
          end: {
            date: dueDate ? new Date(dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          }
        }, empEmail);`);

code = code.replace(/"تم إنشاء المهمة ومزامنتها مع Google Tasks"/g, '"تم إنشاء المهمة ومزامنتها مع Google Calendar"');
code = code.replace(/"تم الحفظ في النظام، ولكن فشلت المزامنة مع Google Tasks"/g, '"تم الحفظ في النظام، ولكن فشلت المزامنة مع Google Calendar"');
code = code.replace(/Failed to sync with Google Tasks/g, 'Failed to sync with Google Calendar');

// Replace sync button call
code = code.replace(/await createGoogleTask\(\{[\s\S]*?\}, currentUserEmail\);/g, 
`await createGoogleCalendarEvent({
                    summary: t.title + " (تكليف داخلي)",
                    description: "الوصف: " + t.description + "\\nالمسند إليه: " + t.assignedTo + "\\nملاحظات: " + (t.additionalNotes || ""),
                    start: { date: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] },
                    end: { date: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] }
                  }, currentUserEmail);`);

code = code.replace(/"مزامنة مع Google Tasks"/g, '"مزامنة مع Google Calendar"');
code = code.replace(/صلاحيات Google Tasks/g, 'صلاحيات Google Calendar');

fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
