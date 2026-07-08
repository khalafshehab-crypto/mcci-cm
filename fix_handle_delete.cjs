const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const handleDeleteSelectedCode = `  const handleDeleteSelected = () => {
    if (selectedMembers.size === 0) return;
    if (window.confirm("هل أنت متأكد من حذف الأعضاء المحددين؟ (لا يمكن التراجع عن هذا الإجراء)")) {
      const nextMembers = members.filter(m => !selectedMembers.has(m.id));
      setMembers(nextMembers);
      setSelectedMembers(new Set());
    }
  };

  const toggleMemberSelection = (id: number) => {`;

content = content.replace('  const toggleMemberSelection = (id: number) => {', handleDeleteSelectedCode);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
fs.writeFileSync('src/pages/Members.tsx', content);
console.log("Fixed handleDeleteSelected");
