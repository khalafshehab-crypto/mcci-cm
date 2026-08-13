import re

files_to_patch = ['src/pages/Events.tsx', 'src/pages/CommitteesEvents.tsx']

for filepath in files_to_patch:
    with open(filepath, 'r') as f:
        content = f.read()

    auth_check = """
        const { getOrCreateFolder, getSharedAccessToken, triggerAuthModal } = await import("../lib/googleApi");
        
        let token = await getSharedAccessToken();
        if (!token) {
          token = await triggerAuthModal();
          if (!token) {
            throw new Error("لم يتم تسجيل الدخول بحساب جوجل");
          }
        }
"""
    
    # Replace the start of `if (hasFilesToUpload) {` block
    content = content.replace("""        showGlobalToast("جاري معالجة ورفع المرفقات إلى Google Drive...", "loading");
        
        const { getOrCreateFolder } = await import("../lib/googleApi");""", 
        """        showGlobalToast("جاري معالجة ورفع المرفقات إلى Google Drive...", "loading");
        """ + auth_check)

    with open(filepath, 'w') as f:
        f.write(content)
