const fs = require('fs');

const files = [
  '/app/applet/src/pages/CommitteesEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Commitees/Centers
  const regex = /const oldCommittee = [^;]+;\s*const newCommittee = [^;]+;\s*if \(oldCommittee && newCommittee\) \{\s*const oldFormatted = [^;]+;\s*const newFormatted = [^;]+;\s*setNewTitle\(prev => prev\.includes\(oldFormatted\) \? prev\.replace\(oldFormatted, newFormatted\) : prev\);\s*\}/g;

  content = content.replace(regex, `setIsTitleManuallyEdited(false);`);
  
  // Affiliates
  const affRegex = /const oldParty = [^;]+;\s*const newParty = [^;]+;\s*if \(oldParty && newParty\) \{\s*setNewTitle\(prev => prev\.includes\(oldParty\) \? prev\.replace\(oldParty, newParty\) : prev\);\s*\}/g;
  content = content.replace(affRegex, `setIsTitleManuallyEdited(false);`);

  // AssistantSecGen
  const asgRegex = /const oldEmployee = [^;]+;\s*const newEmployee = [^;]+;\s*if \(oldEmployee && newEmployee\) \{\s*setNewTitle\(prev => prev\.includes\(oldEmployee\) \? prev\.replace\(oldEmployee, newEmployee\) : prev\);\s*\}/g;
  content = content.replace(asgRegex, `setIsTitleManuallyEdited(false);`);

  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}
