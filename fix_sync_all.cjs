const fs = require('fs');
const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace update sync
  code = code.replace(
    /syncEventsToCalendar\(\[updatedEvent\], dbEmployees, (.*?)\);/g,
    'syncEventsToCalendar([updatedEvent, ...events.filter((e: any) => e.id !== editingEvent?.id)], dbEmployees, $1);'
  );

  // Replace new event sync
  code = code.replace(
    /syncEventsToCalendar\(\[newEvent\], dbEmployees, (.*?)\);/g,
    'syncEventsToCalendar([newEvent, ...events], dbEmployees, $1);'
  );

  // Replace series sync
  code = code.replace(
    /syncEventsToCalendar\(newEventsList, dbEmployees, (.*?)\);/g,
    'syncEventsToCalendar([...newEventsList, ...events], dbEmployees, $1);'
  );

  fs.writeFileSync(file, code);
}
console.log("Updated to sync all events!");
