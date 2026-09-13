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

  // Series creation
  content = content.replace(
    /members: newMembers,/g,
    'members: newMembers,\n      externalInvitees: newType === "متسلسلة" ? seriesExternalInvitees : singleExternalInvitees,'
  );

  fs.writeFileSync(file, content);
  console.log(`Patched ${file} submit`);
}
