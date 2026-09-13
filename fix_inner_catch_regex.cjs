const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = ['Events.tsx', 'CentersEvents.tsx', 'AffiliatesEvents.tsx', 'AssistantSecGenEvents.tsx']
  .map(file => path.join(srcDir, file));

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /\} catch \(updateErr: any\) \{\s*console\.warn\("Failed to update calendar event:", updateErr\);\s*if \(updateErr\.message && \(updateErr\.message\.includes\("404"\) \|\| updateErr\.message\.includes\("410"\)\)\) \{\s*console\.warn\("Event missing from calendar\. Attempting to recreate\.\.\."\);\s*const response = await createGoogleCalendarEvent\(payload\);\s*if \(response && response\.id\) \{\s*updatedGoogleEventIds = \{ "event_id": response\.id \};\s*hasChanges = true;\s*stats\.created\+\+;\s*\}\s*\}\s*\}/g,
    `} catch (updateErr: any) {
           console.warn("Failed to update calendar event:", updateErr);
           
           if (updateErr.message && (updateErr.message.includes("404") || updateErr.message.includes("410"))) {
             console.warn("Event missing from calendar. Attempting to recreate...");
             try {
               const response = await createGoogleCalendarEvent(payload);
               if (response && response.id) {
                 updatedGoogleEventIds = { "event_id": response.id };
                 hasChanges = true;
                 stats.created++;
               }
             } catch (recreateErr) {
               stats.failed++;
             }
           } else {
             stats.failed++;
           }
         }`
  );
  
  fs.writeFileSync(file, content);
  console.log("Updated", file);
});
