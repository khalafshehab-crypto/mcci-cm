import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    old_logic = """  const handleFileUploads = async (files: File[], evt: any, existingAtts: any[]) => {
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
            const itemFolderId = currentFolderId;"""

    new_logic = """  const handleFileUploads = async (files: File[], evt: any, existingAtts: any[]) => {
    
    // Auto-generate the path based on user requirements
    let eventTitle = evt.eventName || evt.title || "بدون عنوان";
    let eventKind = "فعاليات أخرى";
    if (eventTitle.includes("اجتماع")) eventKind = "الاجتماعات";
    else if (eventTitle.includes("لقاء")) eventKind = "اللقاءات";
    else if (eventTitle.includes("زيارة")) eventKind = "الزيارات";
    else if (eventTitle.includes("ورشة عمل")) eventKind = "ورش العمل";

    const defaultPathStr = `/تقرير اللجان للدورة الـ 22/اللجان المعتمدة/${evt.committeeName || "عام"}/الفعاليات/${eventKind}/${eventTitle}/التوصيات/${evt.title || "بدون عنوان"}`;

    setPromptState({
      isOpen: true,
      message: "الرجاء تحديد مسار الحفظ في جوجل درايف:",
      defaultValue: defaultPathStr,
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
          
          const newAtts: any[] = [];
          
          if (token) {
            const parts = pathVal.split('/').filter(p => p.trim());
            let currentFolderId: string | null = null;
            for (const part of parts) {
              if (!currentFolderId) {
                currentFolderId = await getOrCreateFolder(part);
              } else {
                currentFolderId = await getOrCreateFolder(part, currentFolderId);
              }
            }
            const itemFolderId = currentFolderId;"""

    if old_logic in content:
        content = content.replace(old_logic, new_logic)
        with open(filename, 'w') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Could not find exact block in {filename}")

fix_file("src/pages/Recommendations.tsx")
