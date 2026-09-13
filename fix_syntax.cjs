const fs = require('fs');
const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

const newSyncFunc = `
const syncEventsToCalendar = async (eventsList: any[], dbEmployees: any[], collectionName: string) => {
  for (const evt of eventsList) {
    if (!evt.employees || evt.employees.length === 0) continue;
    
    let updatedGoogleEventIds = { ...(evt.googleEventIds || {}) };
    let hasChanges = false;

    for (const empName of evt.employees) {
      const targetEmp = dbEmployees.find((e: any) => e.name === empName);
      if (targetEmp && targetEmp.email) {
        try {
          let startObj: any = { date: evt.date ? new Date(evt.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] };
          let endObj: any = { date: evt.date ? new Date(evt.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] };
          
          if (evt.date && evt.time) {
             const dt = new Date(evt.date + 'T' + evt.time + ':00');
             if (!isNaN(dt.getTime())) {
                startObj = { dateTime: dt.toISOString(), timeZone: "Asia/Riyadh" };
                const endDt = new Date(dt.getTime() + 60*60*1000);
                endObj = { dateTime: endDt.toISOString(), timeZone: "Asia/Riyadh" };
             }
          }

          const payload = {
            summary: evt.title,
            description: "وقت الاجتماع: " + (evt.time || 'غير محدد') + "\\nالقاعة: " + (evt.location || 'غير محدد') + "\\nملاحظات: " + (evt.notes || ''),
            start: startObj,
            end: endObj
          };

          if (updatedGoogleEventIds[empName]) {
             await updateGoogleCalendarEvent(updatedGoogleEventIds[empName], payload, targetEmp.email);
          } else {
             const response = await createGoogleCalendarEvent(payload, targetEmp.email);
             if (response && response.id) {
               updatedGoogleEventIds[empName] = response.id;
               hasChanges = true;
             }
          }
        } catch (err) {
          console.warn("Failed to sync calendar for", empName, err);
        }
      }
    }

    if (hasChanges && collectionName) {
      try {
        await updateDoc(doc(db, collectionName, String(evt.id)), { googleEventIds: updatedGoogleEventIds });
      } catch (e) {
        console.warn("Failed to save googleEventIds", e);
      }
    }
  }
};
`;

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Find where const syncEventsToCalendar starts, and where export default function starts
  const startIdx = code.indexOf('const syncEventsToCalendar');
  const endIdx = code.indexOf('export default function');

  if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + newSyncFunc + '\n' + code.substring(endIdx);
    fs.writeFileSync(file, code);
  }
}
console.log("Fixed!");
