const fs = require('fs');

let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const target = `        // Final check on committee permission
        if (newMember.committeeId && newMember.committeeName && canUserEditCommittee(newMember.committeeName)) {
           if (newMember.name) {
             await addFirebaseMember(newMember);
             successCount++;
           }
        }`;

const replace = `        // Final check on committee permission
        if (newMember.committeeId && newMember.committeeName && canUserEditCommittee(newMember.committeeName)) {
           if (newMember.name) {
              const duplicate = members.find(m => 
                (m.phone && newMember.phone && m.phone.trim() === newMember.phone.trim()) ||
                (m.email && newMember.email && m.email.trim() === newMember.email.trim()) ||
                (m.nationalId && newMember.nationalId && m.nationalId.trim() === newMember.nationalId.trim()) ||
                (m.name && newMember.name && m.name.trim() === newMember.name.trim())
              );
              if (duplicate) {
                 if (duplicate.committeeId !== newMember.committeeId && (!duplicate.secondaryCommitteeId || duplicate.secondaryCommitteeId === 0 || duplicate.secondaryCommitteeId === "")) {
                    await updateFirebaseMember(String(duplicate.id), {
                       secondaryCommitteeId: newMember.committeeId,
                       secondaryCommitteeName: newMember.committeeName
                    });
                    successCount++;
                 }
              } else {
                 await addFirebaseMember(newMember);
                 successCount++;
              }
           }
        }`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
  console.log("Patched executeImport");
} else {
  console.log("Target not found!");
}
