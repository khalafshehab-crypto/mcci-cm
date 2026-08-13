import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_code = '''      } else if (workspaceService === "circular" && circularMainFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve((ev.target?.result as string).split(',')[1]);
        });
        reader.readAsDataURL(circularMainFile);'''

new_code = '''      } else if (workspaceService === "circular" && circularMainFile && typeof circularMainFile === 'object') {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve((ev.target?.result as string).split(',')[1]);
        });
        reader.readAsDataURL(circularMainFile as File);'''

content = content.replace(old_code, new_code)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
