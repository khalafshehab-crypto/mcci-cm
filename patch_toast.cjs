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

  // Add toast to single delete
  content = content.replace(
    /try \{\s*console\.log\("Attempting to delete Google Calendar event:", existingEventId\);\s*const res = await deleteGoogleCalendarEvent\(existingEventId as string\);\s*console\.log\("Successfully deleted Google Calendar event:", existingEventId, res\);\s*\} catch \(err\) \{\s*console\.error\("Failed to delete Google Calendar event:", err\);\s*\}/g,
    `try {
              console.log("Attempting to delete Google Calendar event:", existingEventId);
              await deleteGoogleCalendarEvent(existingEventId as string);
              showGlobalToast("تم حذف الفعالية من النظام وتقويم جوجل بنجاح", "success");
            } catch (err: any) {
              console.error("Failed to delete Google Calendar event:", err);
              showGlobalToast("تم حذف الفعالية من النظام، لكن فشل الحذف من تقويم جوجل: " + (err.message || ""), "error");
            }`
  );

  // Add toast to bulk delete
  content = content.replace(
    /try \{\s*await deleteGoogleCalendarEvent\(existingEventId as string\);\s*\} catch \(err\) \{\s*console\.warn\("Failed to delete Google Calendar event in bulk:", err\);\s*\}/g,
    `try {
              await deleteGoogleCalendarEvent(existingEventId as string);
            } catch (err: any) {
              console.warn("Failed to delete Google Calendar event in bulk:", err);
              showGlobalToast("فشل حذف إحدى الفعاليات من تقويم جوجل: " + (err.message || ""), "error");
            }`
  );

  fs.writeFileSync(file, content);
  console.log(`Patched ${file} toast`);
}
