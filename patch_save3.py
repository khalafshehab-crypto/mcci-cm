import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_upload = '''            if (workspaceService === "circular") {
               if (circularMainFile) await uploadFileToDriveByPath(circularMainFile as File, folderPath, (circularMainFile as File).name);
               if (circularAtt1) await uploadFileToDriveByPath(circularAtt1 as File, folderPath, (circularAtt1 as File).name);
               if (circularAtt2) await uploadFileToDriveByPath(circularAtt2 as File, folderPath, (circularAtt2 as File).name);
               if (circularAtt3) await uploadFileToDriveByPath(circularAtt3 as File, folderPath, (circularAtt3 as File).name);
            }'''

new_upload = '''            if (workspaceService === "circular") {
               if (circularMainFile && typeof circularMainFile === 'object') await uploadFileToDriveByPath(circularMainFile as File, folderPath, (circularMainFile as File).name);
               if (circularAtt1 && typeof circularAtt1 === 'object') await uploadFileToDriveByPath(circularAtt1 as File, folderPath, (circularAtt1 as File).name);
               if (circularAtt2 && typeof circularAtt2 === 'object') await uploadFileToDriveByPath(circularAtt2 as File, folderPath, (circularAtt2 as File).name);
               if (circularAtt3 && typeof circularAtt3 === 'object') await uploadFileToDriveByPath(circularAtt3 as File, folderPath, (circularAtt3 as File).name);
            }'''

content = content.replace(old_upload, new_upload)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
