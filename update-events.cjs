const fs = require('fs');

const file = 'src/pages/CommitteesEvents.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add isSubmitting state
if (!content.includes('const [isSubmitting, setIsSubmitting] = useState(false);')) {
  content = content.replace(
    'const [isConfirmingSeries, setIsConfirmingSeries] = useState(false);',
    'const [isConfirmingSeries, setIsConfirmingSeries] = useState(false);\n  const [isSubmitting, setIsSubmitting] = useState(false);'
  );
}

// 1. Update handleInsertSeries
const handleInsertSeriesMatch = content.match(/const handleInsertSeries = async \(\) => {([\s\S]*?)setIsConfirmingSeries\(false\);/);
if (handleInsertSeriesMatch) {
  let innerBody = handleInsertSeriesMatch[1];
  let newInnerBody = `
    setIsSubmitting(true);
${innerBody}`;
  content = content.replace(handleInsertSeriesMatch[0], `const handleInsertSeries = async () => {${newInnerBody}setIsSubmitting(false);\n    setIsConfirmingSeries(false);`);
}

// 2. Update handleSubmit
const handleSubmitMatch = content.match(/const handleSubmit = async \(e: FormEvent\) => {/);
if (handleSubmitMatch) {
  content = content.replace(
    'const handleSubmit = async (e: FormEvent) => {',
    'const handleSubmit = async (e: FormEvent) => {\n    setIsSubmitting(true);'
  );
  content = content.replace(
    'setIsAddOpen(false);\n  };',
    'setIsSubmitting(false);\n    setIsAddOpen(false);\n  };'
  );
  
  // there's a return inside handleSubmit if conflict or generating dates
  content = content.replace(
    'generateDates();\n      return;',
    'generateDates();\n      setIsSubmitting(false);\n      return;'
  );
  content = content.replace(
    'if (!newTitle.trim() || !newDate || !newCommitteeId || !singleTime) return;',
    'if (!newTitle.trim() || !newDate || !newCommitteeId || !singleTime) { setIsSubmitting(false); return; }'
  );
  content = content.replace(
    'if (!newCommitteeId || newCommitteeId === 0) { alert("يرجى اختيار اللجنة أولاً"); return; }',
    'if (!newCommitteeId || newCommitteeId === 0) { alert("يرجى اختيار اللجنة أولاً"); setIsSubmitting(false); return; }'
  );
  content = content.replace(
    'if (commName && !canUserEditCommittee(commName)) { alert("غير مصرح لك بجدولة فعاليات لهذه اللجنة"); return; }',
    'if (commName && !canUserEditCommittee(commName)) { alert("غير مصرح لك بجدولة فعاليات لهذه اللجنة"); setIsSubmitting(false); return; }'
  );
  content = content.replace(
    'setConflictWarning(conflict);\n      return;',
    'setConflictWarning(conflict);\n      setIsSubmitting(false);\n      return;'
  );
}

// 3. Add loading overlay block and disable buttons
content = content.replace(
  '{isConfirmingSeries ? (',
  '{isSubmitting && (<div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl"><div className="flex flex-col items-center"><div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div><p className="mt-4 font-bold text-gray-700 animate-pulse">جاري إنشاء الفعالية والمزامنة مع جوجل، يرجى الانتظار...</p></div></div>)}\n                {isConfirmingSeries ? ('
);

fs.writeFileSync(file, content);
console.log('Updated CommitteesEvents.tsx');
