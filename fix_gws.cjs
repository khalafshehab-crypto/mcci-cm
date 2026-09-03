const fs = require('fs');
let code = fs.readFileSync('src/components/GoogleWorkspaceCenter.tsx', 'utf8');
code = code.replace(/import \{\s*createGoogleTask,\s*createGoogleCalendarEvent\s*\} from "\.\.\/lib\/googleApi";/, 'import { createGoogleCalendarEvent } from "../lib/googleApi";');
code = code.replace(/createGoogleTask,/g, '');
code = code.replace(/await createGoogleTask\(\{[\s\S]*?\}\);/g, 
`await createGoogleCalendarEvent({
        summary: \`مهمة: \${tasks[0].title}\`,
        description: tasks[0].description,
        start: { date: tasks[0].dueDate ? new Date(tasks[0].dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] },
        end: { date: tasks[0].dueDate ? new Date(tasks[0].dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] }
      });`);

fs.writeFileSync('src/components/GoogleWorkspaceCenter.tsx', code);
