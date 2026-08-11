import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    old_import = 'import { formatCommitteeNameArabic } from "../lib/arabicUtils";'
    new_import = 'import { formatCommitteeNameArabic } from "../lib/arabicUtils";\nimport { getSharedAccessToken, getOrCreateFolder, triggerAuthModal, uploadBinaryFileToDrive } from "../lib/googleApi";\nimport { showGlobalToast } from "../lib/toastUtils";'

    if old_import in content:
        content = content.replace(old_import, new_import)
        with open(filename, 'w') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Could not find exact block in {filename}")

fix_file("src/pages/Recommendations.tsx")
