const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = ['Events.tsx', 'CommitteesEvents.tsx', 'CentersEvents.tsx', 'AffiliatesEvents.tsx', 'AssistantSecGenEvents.tsx']
  .map(file => path.join(srcDir, file));

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // We want to add stats.failed++; to the else branch of the inner catch.
  const badCatch = `         } catch (updateErr: any) {
           console.warn("Failed to update calendar event:", updateErr);
           
           if (updateErr.message && (updateErr.message.includes("404") || updateErr.message.includes("410"))) {
             console.warn("Event missing from calendar. Attempting to recreate...");
             const response = await createGoogleCalendarEvent(payload);
             if (response && response.id) {
               updatedGoogleEventIds = { "event_id": response.id };
               hasChanges = true;
               stats.created++;
             }
           }
         }`;

  const fixedCatch = `         } catch (updateErr: any) {
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
         }`;

  if (content.includes(badCatch)) {
    content = content.replace(badCatch, fixedCatch);
    fs.writeFileSync(file, content);
    console.log("Fixed inner catch in", file);
  } else {
    console.log("Could not find exact string in", file);
  }
});
