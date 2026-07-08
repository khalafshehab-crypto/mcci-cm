const fs = require('fs');

const filesToPatch = [
  'src/pages/CommitteesEvents.tsx',
  'src/pages/Events.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Change Level 3 condition
  const oldLevel3Condition = `selectedClassificationForCards === null ? (`;
  const newLevel3Condition = `selectedClassificationForCards === null && selectedEventKindForCards === "اجتماع" ? (`;
  
  // We need to replace exactly the level 3 check. Let's find it.
  content = content.replace(') : /* Level 3: Classifications inside selected Event Kind & Committee */\n          selectedClassificationForCards === null ? (', ') : /* Level 3: Classifications inside selected Event Kind & Committee */\n          selectedClassificationForCards === null && selectedEventKindForCards === "اجتماع" ? (');

  // Change Level 4 filter
  const oldFilter = `e.committeeId === selectedCommIdForCards &&
                    getEventKindStr(e.title) === selectedEventKindForCards &&
                    getEventClassification(e.title) === selectedClassificationForCards`;
  const newFilter = `e.committeeId === selectedCommIdForCards &&
                    getEventKindStr(e.title) === selectedEventKindForCards &&
                    (selectedEventKindForCards !== "اجتماع" || getEventClassification(e.title) === selectedClassificationForCards)`;

  content = content.replace(oldFilter, newFilter);

  // We should also change the text in Level 4 header.
  const oldHeader = `قائمة الفعاليات الـ (<span className="text-emerald-600">{selectedClassificationForCards}</span>) من نوع (<span className="text-blue-600">{selectedEventKindForCards}</span>) لـ (<span className="text-brand">{rawCommittees.find((c) => c.id === selectedCommIdForCards)?.name}</span>)`;
  
  const newHeader = `{selectedEventKindForCards === "اجتماع" ? (
                    <>قائمة الفعاليات الـ (<span className="text-emerald-600">{selectedClassificationForCards}</span>) من نوع (<span className="text-blue-600">{selectedEventKindForCards}</span>) لـ (<span className="text-brand">{rawCommittees.find((c) => c.id === selectedCommIdForCards)?.name}</span>)</>
                  ) : (
                    <>قائمة فعاليات نوع (<span className="text-blue-600">{selectedEventKindForCards}</span>) لـ (<span className="text-brand">{rawCommittees.find((c) => c.id === selectedCommIdForCards)?.name}</span>)</>
                  )}`;
  content = content.replace(oldHeader, newHeader);

  fs.writeFileSync(file, content);
}
console.log("Patched cards logic successfully");
