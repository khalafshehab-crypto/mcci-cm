const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// 1. Add state for secondaryCommitteeId
code = code.replace(
  /const \[selectedCommitteeId, setSelectedCommitteeId\] = useState<number \| string>\(0\);/,
  `const [selectedCommitteeId, setSelectedCommitteeId] = useState<number | string>(0);\n  const [secondaryCommitteeId, setSecondaryCommitteeId] = useState<number | string>(0);`
);

// 2. Add reset for secondaryCommitteeId in handleOpenAdd
code = code.replace(
  /setSelectedCommitteeId\(0\);/,
  `setSelectedCommitteeId(0);\n    setSecondaryCommitteeId(0);`
);

// 3. Add mapping for editingMember
code = code.replace(
  /setSelectedCommitteeId\(m\.committeeId\);/,
  `setSelectedCommitteeId(m.committeeId);\n    setSecondaryCommitteeId(m.secondaryCommitteeId || 0);`
);

// 4. In form submit, get matched secondary committee
const formSubmitTarget = `const matchedComm = allCommittees.find(c => String(c.id) === String(selectedCommitteeId)) || { name: "لجنة" };`;
const formSubmitReplacement = `const matchedComm = allCommittees.find(c => String(c.id) === String(selectedCommitteeId)) || { name: "لجنة" };
    const matchedSecondaryComm = allCommittees.find(c => String(c.id) === String(secondaryCommitteeId));
    if (matchedSecondaryComm && !canUserEditCommittee(matchedSecondaryComm.name)) {
      setFormError("عذراً، لا تملك الصلاحية لإضافة أو تعديل عضو في اللجنة الإضافية المختارة.");
      return;
    }
    if (String(selectedCommitteeId) === String(secondaryCommitteeId) && String(selectedCommitteeId) !== "0") {
      setFormError("لا يمكن اختيار نفس اللجنة كلجنة إضافية.");
      return;
    }
`;
code = code.replace(formSubmitTarget, formSubmitReplacement);

// 5. Update object creation in Edit
code = code.replace(
  /committeeName: matchedComm\.name,/,
  `committeeName: matchedComm.name,\n            secondaryCommitteeId: secondaryCommitteeId && String(secondaryCommitteeId) !== "0" ? secondaryCommitteeId : undefined,\n            secondaryCommitteeName: matchedSecondaryComm ? matchedSecondaryComm.name : undefined,`
);

// 6. Update object creation in Add
code = code.replace(
  /committeeName: matchedComm\.name,(?![^{]*\n\s*joiningMechanism)/, // this is tricky, wait. let's just do it directly.
  ``
);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("State updated partially");
