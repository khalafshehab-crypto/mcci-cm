const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = ['Events.tsx', 'CommitteesEvents.tsx', 'CentersEvents.tsx', 'AffiliatesEvents.tsx', 'AssistantSecGenEvents.tsx']
  .map(file => path.join(srcDir, file));

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace attendees logic
  const oldAttendeesRegex = /const attendees: \{email: string\}\[\] = \[\];\s*for \(const name of evt\.employees\) \{\s*const emp = dbEmployees\.find\(\(e: any\) => e\.name === name\);\s*if \(emp && emp\.email\) \{\s*attendees\.push\(\{ email: emp\.email \}\);\s*\}\s*\}/g;
  
  const newAttendeesLogic = `const uniqueEmails = new Set<string>();
    for (const name of evt.employees || []) {
      const emp = dbEmployees.find((e: any) => e.name === name);
      if (emp && emp.email) {
        uniqueEmails.add(emp.email);
      }
    }
    const attendees = Array.from(uniqueEmails).map(email => ({ email }));`;
    
  if (content.match(oldAttendeesRegex)) {
     content = content.replace(oldAttendeesRegex, newAttendeesLogic);
  }

  // Replace date logic
  const oldDateRegex = /const dt = new Date\(evt\.date \+ 'T' \+ evt\.time \+ ':00'\);/g;
  const newDateLogic = "const dt = new Date(`${evt.date}T${evt.time}:00+03:00`);";
  content = content.replace(oldDateRegex, newDateLogic);

  fs.writeFileSync(file, content);
  console.log("Updated", path.basename(file));
});
