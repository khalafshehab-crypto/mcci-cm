const fs = require('fs');
const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

const targetPattern = `          if (updatedGoogleEventIds[empName]) {
             await updateGoogleCalendarEvent(updatedGoogleEventIds[empName], payload, targetEmp.email);
          } else {
             const response = await createGoogleCalendarEvent(payload, targetEmp.email);
             if (response && response.id) {
               updatedGoogleEventIds[empName] = response.id;
               hasChanges = true;
             }
          }`;

const replacementPattern = `          if (updatedGoogleEventIds[empName]) {
             try {
               await updateGoogleCalendarEvent(updatedGoogleEventIds[empName], payload, targetEmp.email);
             } catch (updateErr: any) {
               console.warn("Failed to update calendar event, possibly deleted. Attempting to recreate:", updateErr);
               const response = await createGoogleCalendarEvent(payload, targetEmp.email);
               if (response && response.id) {
                 updatedGoogleEventIds[empName] = response.id;
                 hasChanges = true;
               }
             }
          } else {
             const response = await createGoogleCalendarEvent(payload, targetEmp.email);
             if (response && response.id) {
               updatedGoogleEventIds[empName] = response.id;
               hasChanges = true;
             }
          }`;

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('await updateGoogleCalendarEvent(updatedGoogleEventIds[empName]')) {
    // If it hasn't been updated yet
    if (!code.includes('Attempting to recreate:')) {
      code = code.replace(targetPattern, replacementPattern);
      fs.writeFileSync(file, code);
      console.log("Updated", file);
    }
  }
}
console.log("Finished recreate fix.");
