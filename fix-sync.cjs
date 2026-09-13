const fs = require('fs');

const files = [
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/CommitteesEvents.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Insert getSharedAccessToken and triggerAuthModal at the start of syncEventsToCalendar
  content = content.replace(
    /const syncEventsToCalendar = async \(eventsList: any\[\], dbEmployees: any\[\], collectionName: string\) => \{(\s*)let stats = \{ created: 0, updated: 0, failed: 0 \};/g,
    `const syncEventsToCalendar = async (eventsList: any[], dbEmployees: any[], collectionName: string) => {$1let stats = { created: 0, updated: 0, failed: 0 };$1$1const { getSharedAccessToken, triggerAuthModal } = await import("../lib/googleApi");$1let token = await getSharedAccessToken();$1if (!token) {$1  token = await triggerAuthModal();$1  if (!token) {$1    stats.failed = eventsList.length;$1    return stats;$1  }$1}`
  );

  // We should also handle the case where fetchGoogleAPI throws 401 error, but since the token is stored locally/in db, maybe it's sufficient to check getSharedAccessToken. 
  // Wait, if it's expired, fetchGoogleAPI will fail. Should we catch 401 and retry?
  // Let's modify fetchGoogleAPI in src/lib/googleApi.ts instead! It's much cleaner!
  fs.writeFileSync(file, content);
  console.log('Updated', file);
}
