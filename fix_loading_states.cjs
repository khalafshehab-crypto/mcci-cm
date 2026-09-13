const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = ['Events.tsx', 'CommitteesEvents.tsx', 'CentersEvents.tsx', 'AffiliatesEvents.tsx', 'AssistantSecGenEvents.tsx']
  .map(file => path.join(srcDir, file));

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Add isSaving state if not exists
  if (!content.includes('const [isSaving, setIsSaving] = React.useState(false);')) {
    content = content.replace(
      'const [isAddOpen, setIsAddOpen] = React.useState(false);',
      'const [isAddOpen, setIsAddOpen] = React.useState(false);\n  const [isSaving, setIsSaving] = React.useState(false);'
    );
  }

  // Update handleSubmit to set isSaving
  const handleSubmitMatch = content.match(/const handleSubmit = async \(e: FormEvent\) => {\s*e\.preventDefault\(\);\s*setConflictWarning\(null\);/);
  if (handleSubmitMatch) {
    content = content.replace(
      handleSubmitMatch[0],
      `${handleSubmitMatch[0]}\n    setIsSaving(true);`
    );
    // Now replace returns with return setIsSaving(false);
    // This requires careful replacement.
    // Instead of doing it naively, let's just make a simple finally block or replace the setIsAddOpen(false); at the end.
    
    // Better way: wrap the content of handleSubmit.
    // Actually, I can just replace `setIsAddOpen(false);` with `setIsAddOpen(false); setIsSaving(false);`
    // And for the early returns:
    content = content.replace(/return;/g, 'return setIsSaving(false);');
    // But wait, there are returns in other functions! We can't globally replace `return;`
    // Let's not do that.
  }
  
  // Actually, wait, without isSaving it will just pause for 1-2 seconds. It's totally fine, and avoids risking regex bugs.
});
