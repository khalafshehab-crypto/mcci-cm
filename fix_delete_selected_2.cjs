const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const regex = /  const handleDeleteSelected = \(\) => \{[\s\S]*?  const toggleMemberSelection/m;

const newHandleDeleteSelected = `  const handleDeleteSelected = () => {
    if (selectedMembers.size === 0) return;
    setIsDeletingSelected(true);
  };

  const confirmDeleteSelected = () => {
    const nextMembers = members.filter(m => !selectedMembers.has(m.id));
    setMembers(nextMembers);
    setSelectedMembers(new Set());
    setIsDeletingSelected(false);
  };

  const toggleMemberSelection`;

content = content.replace(regex, newHandleDeleteSelected);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
fs.writeFileSync('src/pages/Members.tsx', content);
console.log("Fixed handleDeleteSelected completely");
