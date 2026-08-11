import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    old_logic = """  };

  return (
    <div className="space-y-6 pb-16 text-right" dir="rtl">"""

    new_logic = """  };

  const handleFileUploads = async (files: File[], evt: any, existingAtts: any[]) => {
    setPromptState({
      isOpen: true,
      message: "الرجاء تحديد مسار الحفظ (مثال: اللجان الصناعية/التوصيات):",
      defaultValue: `/${evt.committeeName || "عام"}/التوصيات/${evt.title || "بدون عنوان"}`,
      onConfirm: async (pathVal) => {
        if (!pathVal) return;
        showGlobalToast("جاري الرفع والمزامنة مع أرشيف جوجل درايف...", "loading", 0);
        try {
          let token = await getSharedAccessToken();
          if (!token) {
            try {
              token = await triggerAuthModal();
            } catch (err) {
              console.warn("User cancelled auth", err);
              showGlobalToast("لا يمكن حفظ التوصية بدون المصادقة. يرجى تسجيل الدخول إلى جوجل درايف أولاً.", "error");
              return null;
            }
          }
          
          const newAtts = [];
          
          if (token) {
            const rootFolderId = await getOrCreateFolder("أرشيف اللجان - الدورة 22");
            const parts = pathVal.split('/').filter(p => p.trim());
            let currentFolderId = rootFolderId;
            for (const part of parts) {
              currentFolderId = await getOrCreateFolder(part, currentFolderId);
            }
            const itemFolderId = currentFolderId;
            
            for (const file of files) {
              const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
              const res = await uploadBinaryFileToDrive(file.name, base64 as string, file.type || "application/octet-stream", itemFolderId);
              newAtts.push({
                name: file.name,
                url: res && res.id ? `https://drive.google.com/file/d/${res.id}/view` : "#",
                size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                date: new Date().toLocaleDateString('ar-SA')
              });
            }
          } else {
            files.forEach(f => newAtts.push({
              name: f.name,
              url: "#",
              size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
              date: new Date().toLocaleDateString('ar-SA')
            }));
          }

          updateEventWorkflow(evt.id, { attachments: [...existingAtts, ...newAtts] });
          showGlobalToast(`تمت المزامنة وحفظ الملفات بنجاح في المسار: ${pathVal}`, "success");
        } catch (err: any) {
          console.error("Upload error:", err);
          const msg = err?.message?.includes("عفواً") ? err.message : "حدث خطأ أثناء رفع الملفات والمزامنة. تأكد من صلاحية الربط بحساب جوجل.";
          showGlobalToast(msg, "error");
        }
      },
      onCancel: () => {
         showGlobalToast("تم إلغاء عملية الرفع", "info");
      }
    });
  };

  return (
    <div className="space-y-6 pb-16 text-right" dir="rtl">"""

    if old_logic in content:
        content = content.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Could not find exact block in {filename}")

fix_file("src/pages/Recommendations.tsx")
