const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const duplicateCheck = `
    const isDuplicate = members.some(m => 
      m.id !== editingMember?.id && (
        m.name.trim() === name.trim() ||
        m.email.trim() === email.trim() ||
        m.phone.trim() === phone.trim() ||
        m.nationalId.trim() === nationalId.trim()
      )
    );
    if (isDuplicate) {
      setFormError("عذراً، هذا العضو مسجل مسبقاً في النظام. لا يمكن تكرار الاسم، رقم الجوال، البريد الإلكتروني، أو الهوية.");
      return;
    }
`;

if (code.includes('if (editingMember && !editReason.trim())')) {
  code = code.replace(
    '    if (editingMember && !editReason.trim()) {',
    duplicateCheck + '\n    if (editingMember && !editReason.trim()) {'
  );
  fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
  console.log("Duplicate check added");
} else {
  console.log("Could not find insertion point");
}
