const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = ['Events.tsx', 'CommitteesEvents.tsx', 'CentersEvents.tsx', 'AffiliatesEvents.tsx', 'AssistantSecGenEvents.tsx']
  .map(file => path.join(srcDir, file));

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Change syncEventsToCalendar([updatedEvent] to await syncEventsToCalendar([updatedEvent]
  content = content.replace(/syncEventsToCalendar\(\[updatedEvent\]/g, 'await syncEventsToCalendar([updatedEvent]');
  content = content.replace(/syncEventsToCalendar\(\[newEvent\]/g, 'await syncEventsToCalendar([newEvent]');
  
  // also for bulk creation
  content = content.replace(/syncEventsToCalendar\(newEventsList/g, 'await syncEventsToCalendar(newEventsList');
  
  fs.writeFileSync(file, content);
  console.log("Updated await logic in", file);
});
