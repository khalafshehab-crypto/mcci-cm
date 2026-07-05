import os
import re

files_to_edit = [
    'AssistantSecGenEvents.tsx',
    'CentersEvents.tsx',
    'AffiliatesEvents.tsx',
    'CommitteesEvents.tsx',
    'Events.tsx'
]

for filename in files_to_edit:
    path = os.path.join('src/pages', filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match the entire block:
    # {/* قبل الفعالية */} ... up to but not including </div> (Wait, they have inner divs)
    # Actually, we can match:
    # {newType === "مفردة" && (
    #   <>
    #     {/* قبل الفعالية */}
    # ...
    #   </>
    # )}
    
    # Or just remove the `newType === "مفردة" && (` wrapper if we want.
    # Wait, in the source, it's:
    # {newType === "مفردة" && (
    #   <>
    #     {/* قبل الفعالية */}
    #     ...
    #     {/* بعد الاجتماع */}
    #     ...
    #   </>
    # )}
    
    regex = r'\{newType === "مفردة" && \(\s*<>\s*\{\/\* قبل الفعالية \*\/\}[\s\S]*?\{\/\* بعد الاجتماع \*\/\}[\s\S]*?<\/>\s*\)\}'
    content = re.sub(regex, '', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done part 2")
