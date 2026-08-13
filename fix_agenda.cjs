const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Revert the wrong replacements
  content = content.replace(/currentAgendaFiles/g, 'agendaMinutesFiles');
  content = content.replace(/currentAgendaFile/g, 'agendaMinutesFile');
  
  // Now we have agendaMinutesFiles correctly, and agendaMinutesFile inside the block.
  // Wait, in onClick, we want:
  // const currentAgendaFile = agendaMinutesFiles[evt.id] !== undefined ? agendaMinutesFiles[evt.id] : (evt.approvedMinutesUrl || null);
  // if (!currentAgendaFile) return;
  // So let's replace "agendaMinutesFile" with "currentAgendaFile" strictly inside the onClick block up to the fetch.
  // Actually, we can just replace exactly what we need.
  
  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
}
