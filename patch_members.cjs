const fs = require('fs');

let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// Replace handleFormSubmit duplicate check
const handleFormSubmitTarget = `    const isDuplicate = members.some(m => 
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
    }`;

const handleFormSubmitReplace = `    const duplicate = members.find(m => 
      m.id !== editingMember?.id && (
        (m.phone && phone && m.phone.trim() === phone.trim()) ||
        (m.email && email && m.email.trim() === email.trim()) ||
        (m.nationalId && nationalId && m.nationalId.trim() === nationalId.trim())
      )
    );
    if (duplicate) {
      if (duplicate.committeeId !== Number(selectedCommitteeId) && (!duplicate.secondaryCommitteeId || duplicate.secondaryCommitteeId === 0 || duplicate.secondaryCommitteeId === "")) {
        const confirmMerge = window.confirm(\`هذا العضو مسجل مسبقاً في لجنة "\${duplicate.committeeName}". هل تريد إضافته كعضو في هذه اللجنة أيضاً (كلجنة ثانوية)؟\`);
        if (confirmMerge) {
           await updateFirebaseMember(duplicate.id, {
             secondaryCommitteeId: Number(selectedCommitteeId),
             secondaryCommitteeName: selectedComm?.name || ""
           });
           setFormError("");
           setShowSuccessPrompt(true);
           setIsAddOpen(false);
           return;
        } else {
           setFormError("تم إلغاء الدمج. العضو مسجل مسبقاً.");
           return;
        }
      } else {
        setFormError("عذراً، هذا العضو مسجل مسبقاً في النظام بهذه اللجنة، أو قد استوفى الحد الأقصى للجان (لجنتين).");
        return;
      }
    }`;
code = code.replace(handleFormSubmitTarget, handleFormSubmitReplace);

// Fix executeImport duplicate logic
const executeImportTarget = `        const newMember: Omit<Member, "id"> = {
          name: getColValue("name"),
          phone: getColValue("phone"),
          email: getColValue("email"),
          nationalId: getColValue("nationalId"),
          role: getColValue("role") || "عضو",
          title: getColValue("title") || "الأستاذ",
          customTitle: "",
          committeeId: defaultComm?.id || 0,
          committeeName: defaultComm?.name || "",
          joiningMechanism: getColValue("membership_type") || "مرشح",
          govAgency: "",
          entity: "غرفة مكة المكرمة",
          active: true,
          joinedDate: getColValue("joined_date") || new Date().toISOString().split('T')[0],
          note: getColValue("note") || "مستورد من ملف",
          personalPhoto: "",
          cv: "",
          commercialRegister: "",
          membershipCertificate: "",
          authorization: ""
        };

        if (newMember.name && newMember.committeeId) {
          await addFirebaseMember(newMember);
          successCount++;
        }`;

const executeImportReplace = `        const newMember: Omit<Member, "id"> = {
          name: getColValue("name"),
          phone: getColValue("phone"),
          email: getColValue("email"),
          nationalId: getColValue("nationalId"),
          role: getColValue("role") || "عضو",
          title: getColValue("title") || "الأستاذ",
          customTitle: "",
          committeeId: defaultComm?.id || 0,
          committeeName: defaultComm?.name || "",
          joiningMechanism: getColValue("membership_type") || "مرشح",
          govAgency: "",
          entity: "غرفة مكة المكرمة",
          active: true,
          joinedDate: getColValue("joined_date") || new Date().toISOString().split('T')[0],
          note: getColValue("note") || "مستورد من ملف",
          personalPhoto: "",
          cv: "",
          commercialRegister: "",
          membershipCertificate: "",
          authorization: ""
        };

        if (newMember.name && newMember.committeeId) {
          const duplicate = members.find(m => 
            (m.phone && newMember.phone && m.phone.trim() === newMember.phone.trim()) ||
            (m.email && newMember.email && m.email.trim() === newMember.email.trim()) ||
            (m.nationalId && newMember.nationalId && m.nationalId.trim() === newMember.nationalId.trim())
          );
          if (duplicate) {
             if (duplicate.committeeId !== newMember.committeeId && (!duplicate.secondaryCommitteeId || duplicate.secondaryCommitteeId === 0 || duplicate.secondaryCommitteeId === "")) {
                await updateFirebaseMember(duplicate.id, {
                   secondaryCommitteeId: newMember.committeeId,
                   secondaryCommitteeName: newMember.committeeName
                });
                successCount++;
             }
          } else {
            await addFirebaseMember(newMember);
            successCount++;
          }
        }`;
code = code.replace(executeImportTarget, executeImportReplace);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Patched file");
