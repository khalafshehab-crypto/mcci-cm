const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const regexSubmit = /const handleFormSubmit = async \(e: FormEvent\) => \{[\s\S]*?let token = await getSharedAccessToken\(\);\n    if \(!token\) \{[\s\S]*?\}\n    \} else \{\n      if \(formationLetter && typeof formationLetter === "object" && "name" in formationLetter\) finalFormationLetter = \(formationLetter as any\)\.name;\n      if \(membersApproval && typeof membersApproval === "object" && "name" in membersApproval\) finalMembersApproval = \(membersApproval as any\)\.name;\n      if \(regulations && typeof regulations === "object" && "name" in regulations\) finalRegulations = \(regulations as any\)\.name;\n      if \(guides && typeof guides === "object" && "name" in guides\) finalGuides = \(guides as any\)\.name;\n    \}\n/m;

const replacementSubmit = `const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNewMtgError("يرجى إدخال اسم اللجنة بالكامل");
      return;
    }
    if (!desc.trim()) {
      setNewMtgError("يرجى إدخال وصف مبسط لأعمال اللجنة");
      return;
    }
    if (editingComm && !editReason.trim()) {
      setNewMtgError("يرجى توضيح سبب التعديل");
      return;
    }

    let folderId = editingComm?.driveFolderId || "";
    let membersFolderId = "";

    let finalFormationLetter = typeof formationLetter === "string" ? formationLetter : "";
    let finalMembersApproval = typeof membersApproval === "string" ? membersApproval : "";
    let finalRegulations = typeof regulations === "string" ? regulations : "";
    let finalGuides = typeof guides === "string" ? guides : "";

    const hasFilesToUpload = 
      (formationLetter && typeof formationLetter === "object" && "name" in formationLetter) ||
      (membersApproval && typeof membersApproval === "object" && "name" in membersApproval) ||
      (regulations && typeof regulations === "object" && "name" in regulations) ||
      (guides && typeof guides === "object" && "name" in guides);

    let token = await getSharedAccessToken();
    if (!token) {
      try {
        token = await triggerAuthModal();
      } catch (err) {
        console.warn("User cancelled auth", err);
        if (hasFilesToUpload) {
          alert("لا يمكن رفع المرفقات أو إنشاء المجلدات بدون تسجيل الدخول بحساب جوجل. يرجى المحاولة مرة أخرى وتأكيد المصادقة.");
          return;
        }
      }
    }

    if (token) {
      try {
        const readFileAsBase64 = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1] || "");
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        };

        const uploadAttachment = async (file: File | string | null, label: string, targetFolderId: string) => {
          if (file && typeof file === "object" && "name" in file) {
            const ext = (file as any).name.split('.').pop();
            const fileName = \`\${label} - \${name.trim()}.\${ext}\`;
            const base64 = await readFileAsBase64(file as any);
            const res = await uploadBinaryFileToDrive(fileName, base64 as string, (file as any).type || "application/octet-stream", targetFolderId);
            return res && res.id ? \`https://drive.google.com/file/d/\${res.id}/view\` : fileName;
          }
          return typeof file === "string" ? file : "";
        };

        const rootFolderId = await getOrCreateFolder("تقرير اللجان القطاعية الـ 22");
        const approvedCommitteesFolderId = await getOrCreateFolder("اللجان المعتمدة", rootFolderId);
        folderId = await getOrCreateFolder(name.trim(), approvedCommitteesFolderId);
        membersFolderId = await getOrCreateFolder("أعضاء اللجنة", folderId);

        if (formationLetter && typeof formationLetter === "object" && "name" in formationLetter) {
          finalFormationLetter = await uploadAttachment(formationLetter, "قرار التشكيل", folderId);
        }
        if (membersApproval && typeof membersApproval === "object" && "name" in membersApproval) {
          finalMembersApproval = await uploadAttachment(membersApproval, "قرار اعتماد الأعضاء", membersFolderId);
        }
        if (regulations && typeof regulations === "object" && "name" in regulations) {
          finalRegulations = await uploadAttachment(regulations, "اللوائح", folderId);
        }
        if (guides && typeof guides === "object" && "name" in guides) {
          finalGuides = await uploadAttachment(guides, "الأدلة", folderId);
        }

      } catch (err) {
        console.error("Failed to create Drive folder or upload files:", err);
        alert("فشل إنشاء مجلد اللجنة في جوجل درايف أو رفع الملفات، يرجى التأكد من تسجيل الدخول وإعادة المحاولة.");
        return; // Stop saving if Drive operations fail
      }
    } else {
      // Token still falsey (maybe cancelled and had no files to upload, so we just proceed normally)
      if (formationLetter && typeof formationLetter === "object" && "name" in formationLetter) finalFormationLetter = (formationLetter as any).name;
      if (membersApproval && typeof membersApproval === "object" && "name" in membersApproval) finalMembersApproval = (membersApproval as any).name;
      if (regulations && typeof regulations === "object" && "name" in regulations) finalRegulations = (regulations as any).name;
      if (guides && typeof guides === "object" && "name" in guides) finalGuides = (guides as any).name;
    }
`;

content = content.replace(regexSubmit, replacementSubmit);
fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
