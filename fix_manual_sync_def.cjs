const fs = require('fs');

const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  if (!code.includes('const handleManualSync = async () => {')) {
    const currentCollectionName = file.includes('Committees') ? 'events' : file.includes('Centers') ? 'centers_events' : file.includes('Affiliates') ? 'affiliates_events' : 'assistant_sec_gen_events';

    const definition = `
  const [isSyncing, setIsSyncing] = useState(false);
  const handleManualSync = async () => {
    setIsSyncing(true);
    const currentCollectionName = "${currentCollectionName}";
    showGlobalToast("جاري مزامنة التقويم، يرجى الانتظار...", "info");
    const stats = await syncEventsToCalendar(events, dbEmployees, currentCollectionName);
    setIsSyncing(false);
    if (stats && (stats.created > 0 || stats.updated > 0 || stats.failed > 0)) {
      showGlobalToast(\`اكتملت المزامنة! تمت إضافة: \${stats.created}، وتحديث: \${stats.updated}، وفشل: \${stats.failed}\`, "success");
    } else {
      showGlobalToast("لا توجد مواعيد جديدة للمزامنة.", "info");
    }
  };
`;

    // Find a good place to inject. Let's look for `const [currentDate, setCurrentDate]`
    code = code.replace(/const \[currentDate, setCurrentDate\][^\n]*\n/, (match) => {
      return match + definition;
    });

    fs.writeFileSync(file, code);
    console.log("Fixed", file);
  }
}
