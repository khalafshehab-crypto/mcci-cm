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

  content = content.replace(
    /try \{\s*await deleteGoogleCalendarEvent\(existingEventId as string\);\s*\} catch \(err\) \{\s*console\.warn\("Failed to delete Google Calendar event:", err\);\s*\}/g,
    `try {
              console.log("Attempting to delete Google Calendar event:", existingEventId);
              const res = await deleteGoogleCalendarEvent(existingEventId as string);
              console.log("Successfully deleted Google Calendar event:", existingEventId, res);
            } catch (err) {
              console.error("Failed to delete Google Calendar event:", err);
            }`
  );

  fs.writeFileSync(file, content);
  console.log(`Patched ${file} logging`);
}
