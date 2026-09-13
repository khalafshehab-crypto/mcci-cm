import re
import sys

new_sync = r'''const syncEventsToCalendar = async (eventsList: any[], dbEmployees: any[], collectionName: string) => {
  let stats = { created: 0, updated: 0, failed: 0 };
  for (const evt of eventsList) {
    if (!evt.employees || evt.employees.length === 0) continue;
    
    let updatedGoogleEventIds = { ...(evt.googleEventIds || {}) };
    let hasChanges = false;
    
    const mainEmpName = evt.employees[0];
    const targetEmp = dbEmployees.find((e: any) => e.name === mainEmpName);
    
    if (targetEmp && targetEmp.email) {
      const attendees: {email: string}[] = [];
      const additionalEmpNames = evt.employees.slice(1);
      for (const name of additionalEmpNames) {
        const emp = dbEmployees.find((e: any) => e.name === name);
        if (emp && emp.email) {
          attendees.push({ email: emp.email });
        }
      }

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

        const payload: any = {
          summary: evt.title,
          description: "وقت الاجتماع: " + (evt.time || 'غير محدد') + "\nالقاعة: " + (evt.location || 'غير محدد') + "\nملاحظات: " + (evt.notes || ''),
          start: startObj,
          end: endObj,
          attendees: attendees
        };

        if (updatedGoogleEventIds[mainEmpName]) {
           try {
             await updateGoogleCalendarEvent(updatedGoogleEventIds[mainEmpName], payload, targetEmp.email);
             stats.updated++;
           } catch (updateErr: any) {
             console.warn("Failed to update calendar event, possibly deleted. Attempting to recreate:", updateErr);
             const response = await createGoogleCalendarEvent(payload, targetEmp.email);
             if (response && response.id) {
               updatedGoogleEventIds[mainEmpName] = response.id;
               hasChanges = true;
               stats.created++;
             }
           }
        } else {
           const response = await createGoogleCalendarEvent(payload, targetEmp.email);
           if (response && response.id) {
             updatedGoogleEventIds[mainEmpName] = response.id;
             hasChanges = true;
             stats.created++;
           }
        }
      } catch (err) {
        console.warn("Failed to sync calendar for main employee", mainEmpName, err);
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
  return stats;
};'''

old_sync_regex = r'const syncEventsToCalendar = async \(eventsList: any\[\], dbEmployees: any\[\], collectionName: string\) => \{.*?\n\s+return stats;\n\};'

files = [
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/AssistantSecGenEvents.tsx',
    'src/pages/CentersEvents.tsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(old_sync_regex, new_sync, content, flags=re.DOTALL)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done all")
