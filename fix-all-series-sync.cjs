const fs = require('fs');

const files = [
  'src/pages/CommitteesEvents.tsx',
  'src/pages/CentersEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  const oldCode = `    newEventsList.forEach(async (ev) => { await setDoc(doc(db, "events", String(ev.id)), ev); });
    const stats = await syncEventsToCalendar(newEventsList, dbEmployees, "events", allMembers);`;

  const newCode = `    for (const ev of newEventsList) {
      await setDoc(doc(db, "events", String(ev.id)), ev);
    }
    const stats = await syncEventsToCalendar(newEventsList, dbEmployees, "events", allMembers);`;

  content = content.replace(oldCode, newCode);
  
  // also fix collection name if it's not "events"
  const oldCode2 = `    newEventsList.forEach(async (ev) => { await setDoc(doc(db, collectionName, String(ev.id)), ev); });
    const stats = await syncEventsToCalendar(newEventsList, dbEmployees, collectionName, allMembers);`;

  const newCode2 = `    for (const ev of newEventsList) {
      await setDoc(doc(db, collectionName, String(ev.id)), ev);
    }
    const stats = await syncEventsToCalendar(newEventsList, dbEmployees, collectionName, allMembers);`;

  content = content.replace(oldCode2, newCode2);
  
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}
