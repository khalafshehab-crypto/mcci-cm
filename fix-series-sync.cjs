const fs = require('fs');
const file = 'src/pages/CommitteesEvents.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `    newEventsList.forEach(async (ev) => { await setDoc(doc(db, "events", String(ev.id)), ev); });
    const stats = await syncEventsToCalendar(newEventsList, dbEmployees, "events", allMembers);`;

const newCode = `    for (const ev of newEventsList) {
      await setDoc(doc(db, "events", String(ev.id)), ev);
    }
    const stats = await syncEventsToCalendar(newEventsList, dbEmployees, "events", allMembers);`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(file, content);
console.log('Fixed handleConfirmSeries');
