const fs = require('fs');
const path = require('path');

const files = [
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/CommitteesEvents.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Modify function signature
  content = content.replace(
    /const syncEventsToCalendar = async \(eventsList: any\[\], dbEmployees: any\[\], collectionName: string\) => \{/g,
    `const syncEventsToCalendar = async (eventsList: any[], dbEmployees: any[], collectionName: string, allMembers: any[] = []) => {`
  );

  // Add the email extraction logic
  const searchFor = `    for (const name of evt.employees || []) {
      const emp = dbEmployees.find((e: any) => e.name === name);
      if (emp && emp.email) {
        uniqueEmails.add(emp.email);
      }
    }`;

  const replaceWith = `    for (const name of evt.employees || []) {
      const emp = dbEmployees.find((e: any) => e.name === name);
      if (emp && emp.email) {
        uniqueEmails.add(emp.email);
      }
    }
    
    // Add external invitees emails
    for (const ext of evt.externalInvitees || []) {
      const extracted = ext.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g);
      if (extracted) {
        extracted.forEach((email) => uniqueEmails.add(email));
      }
    }

    // Add members emails
    for (const mId of evt.members || []) {
      const m = allMembers.find((m: any) => m.id === mId);
      if (m && m.email) {
        uniqueEmails.add(m.email);
      }
    }`;

  content = content.replace(searchFor, replaceWith);

  // Update the calls to syncEventsToCalendar
  content = content.replace(
    /syncEventsToCalendar\(toSync, dbEmployees, currentCollectionName\)/g,
    `syncEventsToCalendar(toSync, dbEmployees, currentCollectionName, allMembers)`
  );
  
  content = content.replace(
    /syncEventsToCalendar\(newEventsList, dbEmployees, "(.*?)"\)/g,
    `syncEventsToCalendar(newEventsList, dbEmployees, "$1", allMembers)`
  );

  content = content.replace(
    /syncEventsToCalendar\(\[updatedEvent\], dbEmployees, "(.*?)"\)/g,
    `syncEventsToCalendar([updatedEvent], dbEmployees, "$1", allMembers)`
  );
  
  content = content.replace(
    /syncEventsToCalendar\(\[newEvent\], dbEmployees, "(.*?)"\)/g,
    `syncEventsToCalendar([newEvent], dbEmployees, "$1", allMembers)`
  );


  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
