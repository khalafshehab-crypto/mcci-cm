import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # 1. Fix missing showGlobalToast import in Events.tsx and CommitteesEvents.tsx
    if filename in ["src/pages/Events.tsx", "src/pages/CommitteesEvents.tsx"]:
        if "import { showGlobalToast" not in content:
            content = 'import { showGlobalToast } from "../lib/toastUtils";\n' + content
    
    # 2. Fix missing setPromptState and showGlobalToast in Recommendations.tsx
    if filename == "src/pages/Recommendations.tsx":
        if "import { showGlobalToast" not in content:
            content = 'import { showGlobalToast } from "../lib/toastUtils";\n' + content

        # Replace setPromptState logic with window.prompt
        old_prompt = """    setPromptState({
      isOpen: true,
      message: "الرجاء تحديد مسار الحفظ في جوجل درايف:",
      defaultValue: defaultPathStr,
      onConfirm: async (pathVal) => {"""
        
        new_prompt = """    const pathVal = window.prompt("الرجاء تحديد مسار الحفظ في جوجل درايف:", defaultPathStr);
    if (pathVal) {
      const execUpload = async (pathVal: string) => {"""

        if old_prompt in content:
            content = content.replace(old_prompt, new_prompt)
            # We also need to fix the closing braces.
            # Find the line: "}, onCancel: () => { showGlobalToast("تم إلغاء عملية الرفع", "info"); } });"
            old_close = """      },
      onCancel: () => {
         showGlobalToast("تم إلغاء عملية الرفع", "info");
      }
    });"""
            new_close = """      };
      execUpload(pathVal);
    } else {
      showGlobalToast("تم إلغاء عملية الرفع", "error");
    }"""
            content = content.replace(old_close, new_close)
            
            # replace "info" with "success" or "error" in showGlobalToast to fix TS error
            content = content.replace('"info"', '"error"')

    with open(filename, 'w') as f:
        f.write(content)
    print(f"Updated {filename}")

fix_file("src/pages/Events.tsx")
fix_file("src/pages/CommitteesEvents.tsx")
fix_file("src/pages/Recommendations.tsx")
fix_file("src/pages/CommitteesRecommendations.tsx")
