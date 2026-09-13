const fs = require('fs');

const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // 1. Add RefreshCw import if not present
  if (!code.includes('RefreshCw')) {
    code = code.replace(/import \{([^}]*)Calendar,/, 'import {$1RefreshCw, Calendar,');
  }

  // 2. Change syncEventsToCalendar definition and return stats
  // First, find the function signature
  code = code.replace(/const syncEventsToCalendar = async \(eventsList: any\[\], dbEmployees: any\[\], collectionName: string\) => \{/, 
`const syncEventsToCalendar = async (eventsList: any[], dbEmployees: any[], collectionName: string) => {
  let stats = { created: 0, updated: 0, failed: 0 };`);

  code = code.replace(/stats\.updated\+\+;.*?\n.*?} catch \(updateErr: any\)/gs, (match) => {
    // just in case we run it multiple times, we avoid appending stats again and again
    return match;
  });

  // Inject stats updates
  code = code.replace(/await updateGoogleCalendarEvent\(updatedGoogleEventIds\[empName\], payload, targetEmp\.email\);/g, 
    `await updateGoogleCalendarEvent(updatedGoogleEventIds[empName], payload, targetEmp.email);\n               stats.updated++;`);
  
  code = code.replace(/hasChanges = true;/g, `hasChanges = true;\n                 stats.created++;`);
  
  // Need to make sure we don't multiply stats.created++ if script is run twice
  code = code.replace(/stats\.created\+\+;\n\s+stats\.created\+\+;/g, `stats.created++;`);
  code = code.replace(/stats\.updated\+\+;\n\s+stats\.updated\+\+;/g, `stats.updated++;`);

  // Close the function and return stats
  // We look for:
  //    }
  //  }
  // } // end of syncEventsToCalendar (approx)
  // Let's do something safer. Find the end of syncEventsToCalendar
  const syncEndRegex = /console\.warn\("Failed to save googleEventIds", e\);\n      \}\n    \}\n  \}/g;
  if (!code.includes('return stats;')) {
    code = code.replace(syncEndRegex, `console.warn("Failed to save googleEventIds", e);\n      }\n    }\n  }\n  return stats;`);
  }

  // 3. Revert aggressive auto-sync in handleSubmit
  code = code.replace(/syncEventsToCalendar\(\[\.\.\.newEventsList, \.\.\.events\], dbEmployees, (.*?)\);/g, 'syncEventsToCalendar(newEventsList, dbEmployees, $1);');
  code = code.replace(/syncEventsToCalendar\(\[updatedEvent, \.\.\.events\.filter\(\(e: any\) => e\.id !== editingEvent\?\.id\)\], dbEmployees, (.*?)\);/g, 'syncEventsToCalendar([updatedEvent], dbEmployees, $1);');
  code = code.replace(/syncEventsToCalendar\(\[newEvent, \.\.\.events\], dbEmployees, (.*?)\);/g, 'syncEventsToCalendar([newEvent], dbEmployees, $1);');

  // 4. Add isSyncing state and handleManualSync
  if (!code.includes('const [isSyncing, setIsSyncing] = useState(false);')) {
    code = code.replace(/const \[viewMode, setViewMode\] = useState<"table" \| "grid">/, 
`const [isSyncing, setIsSyncing] = useState(false);
  const handleManualSync = async () => {
    setIsSyncing(true);
    let targetCollection = "";
    if (file === "src/pages/CommitteesEvents.tsx") targetCollection = "events";
    else if (file === "src/pages/CentersEvents.tsx") targetCollection = "centers_events";
    else if (file === "src/pages/AffiliatesEvents.tsx") targetCollection = "affiliates_events";
    else if (file === "src/pages/AssistantSecGenEvents.tsx") targetCollection = "assistant_sec_gen_events";
    // wait we need to know the collection dynamically
    // let's just grab it from the code (it uses "events", "centers_events", etc)
    const currentCollectionName = "${file.includes('Committees') ? 'events' : file.includes('Centers') ? 'centers_events' : file.includes('Affiliates') ? 'affiliates_events' : 'assistant_sec_gen_events'}";
    
    showGlobalToast("جاري مزامنة التقويم، يرجى الانتظار...", "info");
    const stats = await syncEventsToCalendar(events, dbEmployees, currentCollectionName);
    setIsSyncing(false);
    if (stats && (stats.created > 0 || stats.updated > 0 || stats.failed > 0)) {
      showGlobalToast(\`اكتملت المزامنة! تمت إضافة: \${stats.created}، وتحديث: \${stats.updated}، وفشل: \${stats.failed}\`, "success");
    } else {
      showGlobalToast("لا توجد مواعيد جديدة للمزامنة.", "info");
    }
  };
  const [viewMode, setViewMode] = useState<"table" | "grid">`);
  }

  // 5. Add the Sync button to UI
  if (!code.includes('<span>مزامنة التقويم</span>')) {
    code = code.replace(/<button\n\s+type="button"\n\s+onClick=\{handleOpenAdd\}/, 
`<button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="h-10 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={\`w-4.5 h-4.5 stroke-[2.5] \${isSyncing ? 'animate-spin' : ''}\`} />
            <span>مزامنة التقويم</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}`);
  }

  fs.writeFileSync(file, code);
  console.log("Updated", file);
}
console.log("Done");
