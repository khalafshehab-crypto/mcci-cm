const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  if (!code.includes('const generateAILetter = async () =>')) {
    const funcs = `
  const generateAILetter = async () => {
    setIsAIGenGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate-new-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: aiGenRecipientName,
          recipientPosition: aiGenRecipientPosition,
          subject: aiGenSubject,
          details: aiGenDetails,
          contact: aiGenContact,
          signatory: aiGenSignatory
        })
      });
      const data = await response.json();
      if (data.text) {
        setAiGenGeneratedText(data.text);
        setAiGenStep(3);
      } else {
        showToast("حدث خطأ أثناء التوليد", "error");
      }
    } catch (e) {
      showToast("حدث خطأ أثناء الاتصال بالخادم", "error");
    } finally {
      setIsAIGenGenerating(false);
    }
  };

  const saveAIGeneratedLetter = async () => {
    try {
      const newDoc = {
        title: aiGenSubject || "خطاب جديد",
        type: "خطابات",
        subType: "مسودات",
        content: aiGenGeneratedText,
        author: "الأخصائي",
        date: new Date().toISOString(),
        committeeId: aiGenCommittee || "",
        tags: ["خطاب", "مسودة"]
      };
      await addDoc(collection(db, "library"), newDoc);
      showToast("تم حفظ وأرشفة الخطاب بنجاح", "success");
      setIsAIGenOpen(false);
    } catch (e) {
      showToast("حدث خطأ أثناء الحفظ", "error");
    }
  };
`;
    // Insert before openGenerateWizard
    code = code.replace(/const openGenerateWizard = \(\) => {/, match => funcs + '\n  ' + match);
    fs.writeFileSync(file, code);
    console.log("Patched " + file);
  }
}

patchFile('src/pages/CommitteesLibrary.tsx');
patchFile('src/pages/Library.tsx');
