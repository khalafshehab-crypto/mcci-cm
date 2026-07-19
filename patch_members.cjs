const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const regexSubmit = /const handleFormSubmit = async \(e: FormEvent\) => \{[\s\S]*?let token = await getSharedAccessToken\(\);\n    if \(!token\) \{[\s\S]*?\}\n    \} else \{\n      if \(personalPhoto && typeof personalPhoto === "object" && "name" in personalPhoto\) finalPersonalPhoto = \(personalPhoto as any\)\.name;\n      if \(cv && typeof cv === "object" && "name" in cv\) finalCv = \(cv as any\)\.name;\n      if \(commercialRegister && typeof commercialRegister === "object" && "name" in commercialRegister\) finalCommercialRegister = \(commercialRegister as any\)\.name;\n      if \(membershipCertificate && typeof membershipCertificate === "object" && "name" in membershipCertificate\) finalMembershipCertificate = \(membershipCertificate as any\)\.name;\n      if \(authorization && typeof authorization === "object" && "name" in authorization\) finalAuthorization = \(authorization as any\)\.name;\n    \}\n/m;

const replacementSubmit = `const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("يرجى إدخال الاسم الرباعي");
      return;
    }
    if (title === "غير ذلك" && !customTitle.trim()) {
      setFormError("يرجى تحديد اللقب يدويًا");
      return;
    }
    if (!selectedCommitteeId || selectedCommitteeId === 0 || selectedCommitteeId === "") {
      setFormError("يرجى اختيار اللجنة");
      return;
    }
    if (joiningMechanism === "ممثل لجهة حكومية" && !govAgency.trim()) {
      setFormError("يرجى إدخال اسم الجهة الممثلة");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!phone.trim()) {
      setFormError("يرجى إدخال رقم الجوال");
      return;
    }
    if (!nationalId.trim()) {
      setFormError("يرجى إدخال رقم الهوية الوطنية أو الإقامة");
      return;
    }
    if (editingMember && !editReason.trim()) {
      setFormError("يرجى توضيح سبب التعديل");
      return;
    }

    const matchedComm = allCommittees.find(c => String(c.id) === String(selectedCommitteeId)) || { name: "لجنة" };
    if (matchedComm && matchedComm.name !== "لجنة" && !canUserEditCommittee(matchedComm.name)) { alert("غير مصرح لك بإضافة أعضاء لهذه اللجنة"); return; }

    if (!canUserEditCommittee(matchedComm.name)) {
      setFormError("عذراً، لا تملك الصلاحية لإضافة أو تعديل عضو في هذه اللجنة. يمكنك فقط إدارة لجانك المكلف بها.");
      return;
    }

    // Auto calculate membershipType
    const calculatedEntity = joiningMechanism === "ممثل لجهة حكومية" 
      ? govAgency.trim() 
      : "غرفة مكة المكرمة";

    let finalPersonalPhoto = typeof personalPhoto === "string" ? personalPhoto : "";
    let finalCv = typeof cv === "string" ? cv : "";
    let finalCommercialRegister = typeof commercialRegister === "string" ? commercialRegister : "";
    let finalMembershipCertificate = typeof membershipCertificate === "string" ? membershipCertificate : "";
    let finalAuthorization = typeof authorization === "string" ? authorization : "";

    const hasFilesToUpload = 
      (personalPhoto && typeof personalPhoto === "object" && "name" in personalPhoto) ||
      (cv && typeof cv === "object" && "name" in cv) ||
      (commercialRegister && typeof commercialRegister === "object" && "name" in commercialRegister) ||
      (membershipCertificate && typeof membershipCertificate === "object" && "name" in membershipCertificate) ||
      (authorization && typeof authorization === "object" && "name" in authorization);

    let memberFolderId = editingMember?.driveFolderId || "";

    showGlobalToast("جاري المعالجة والرفع إلى السحابة المركزية...", "loading", 0);

    let token = await getSharedAccessToken();
    if (!token) {
      try {
        token = await triggerAuthModal();
      } catch (err) {
        console.warn("User cancelled or failed to authenticate", err);
        if (hasFilesToUpload) {
          hideGlobalToast();
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

        const uploadAttachment = async (file: File | string | null, label: string) => {
          if (file && typeof file === "object" && "name" in file) {
            const ext = (file as any).name.split('.').pop();
            const fileName = \`\${label} لـ \${name.trim()}.\${ext}\`;
            const base64 = await readFileAsBase64(file as any);
            const res = await uploadBinaryFileToDrive(fileName, base64 as string, (file as any).type || "application/octet-stream", memberFolderId);
            return res && res.id ? \`https://drive.google.com/file/d/\${res.id}/view\` : fileName;
          }
          return typeof file === "string" ? file : "";
        };

        // Get or Create Folders (بناء الهيكل الأرشيفي المتسلسل)
        const rootFolderId = await getOrCreateFolder("تقرير اللجان القطاعية الـ 22");
        const approvedCommitteesFolderId = await getOrCreateFolder("اللجان المعتمدة", rootFolderId);
        const commFolderId = await getOrCreateFolder(matchedComm.name, approvedCommitteesFolderId);
        const committeeMembersFolderId = await getOrCreateFolder("أعضاء اللجنة", commFolderId);
        memberFolderId = await getOrCreateFolder(name.trim(), committeeMembersFolderId);

        // Upload files
        if (personalPhoto && typeof personalPhoto === "object" && "name" in personalPhoto) finalPersonalPhoto = await uploadAttachment(personalPhoto, "الصورة الشخصية");
        if (cv && typeof cv === "object" && "name" in cv) finalCv = await uploadAttachment(cv, "السيرة الذاتية");
        if (commercialRegister && typeof commercialRegister === "object" && "name" in commercialRegister) finalCommercialRegister = await uploadAttachment(commercialRegister, "السجل التجاري");
        if (membershipCertificate && typeof membershipCertificate === "object" && "name" in membershipCertificate) finalMembershipCertificate = await uploadAttachment(membershipCertificate, "شهادة العضوية");
        if (authorization && typeof authorization === "object" && "name" in authorization) finalAuthorization = await uploadAttachment(authorization, "مستند التفويض");

      } catch (err: any) {
        hideGlobalToast();
        console.error("Failed to upload files to Drive:", err);
        if (err.message && err.message.includes("انتهت صلاحية")) {
          showGlobalToast(err.message, "error");
        } else {
          showGlobalToast("فشل إنشاء أو رفع الملفات في جوجل درايف: " + err.message, "error");
        }
        return; // Stop saving to Firestore if Drive upload fails
      }
    } else {
      if (personalPhoto && typeof personalPhoto === "object" && "name" in personalPhoto) finalPersonalPhoto = (personalPhoto as any).name;
      if (cv && typeof cv === "object" && "name" in cv) finalCv = (cv as any).name;
      if (commercialRegister && typeof commercialRegister === "object" && "name" in commercialRegister) finalCommercialRegister = (commercialRegister as any).name;
      if (membershipCertificate && typeof membershipCertificate === "object" && "name" in membershipCertificate) finalMembershipCertificate = (membershipCertificate as any).name;
      if (authorization && typeof authorization === "object" && "name" in authorization) finalAuthorization = (authorization as any).name;
    }
`;

content = content.replace(regexSubmit, replacementSubmit);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
