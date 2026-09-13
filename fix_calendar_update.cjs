const fs = require('fs');

const collectionMap = {
  'src/pages/CentersEvents.tsx': 'centers_events',
  'src/pages/CommitteesEvents.tsx': 'events',
  'src/pages/AffiliatesEvents.tsx': 'affiliates_events',
  'src/pages/AssistantSecGenEvents.tsx': 'assistant_sec_gen_events'
};

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
          let startObj = { date: evt.date ? new Date(evt.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] };
          let endObj = { date: evt.date ? new Date(evt.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] };
          
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

for (const [file, coll] of Object.entries(collectionMap)) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace old syncEventsToCalendar
  code = code.replace(/const syncEventsToCalendar = async \([\s\S]*?};\n/s, newSyncFunc);

  // Fix calls to syncEventsToCalendar
  code = code.replace(/syncEventsToCalendar\(\[newEvent\], dbEmployees\)/g, 'syncEventsToCalendar([newEvent], dbEmployees, "' + coll + '")');
  code = code.replace(/syncEventsToCalendar\(newEventsList, dbEmployees\)/g, 'syncEventsToCalendar(newEventsList, dbEmployees, "' + coll + '")');

  // Add the call for update as well
  const updatePattern = /setEvents\(events\.map\(ev => ev\.id === editingEvent\.id \? \{([\s\S]*?)\} : ev\)\);/s;
  if (code.match(updatePattern)) {
    code = code.replace(updatePattern, (match, p1) => {
        return 'const updatedEvent = { ' + p1 + ' };\n      setEvents(events.map(ev => ev.id === editingEvent.id ? updatedEvent : ev));\n      syncEventsToCalendar([updatedEvent], dbEmployees, "' + coll + '");\n      showGlobalToast("تم تحديث الفعالية ومحاولة مزامنتها مع تقويم جوجل للموظف", "success");';
    });
  }

  fs.writeFileSync(file, code);
}
console.log("Updated files!");
