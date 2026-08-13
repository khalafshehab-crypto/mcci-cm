import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_upload = '''            if (aiGenReplyFile) {
              const attachmentName = `مرفق خطاب ${subjectName} ${committeeName}`;
              await uploadFileToDriveByPath(aiGenReplyFile, folderPath, attachmentName);
            }'''

new_upload = '''            if (aiGenReplyFile) {
              const attachmentName = `مرفق خطاب ${subjectName} ${committeeName}`;
              await uploadFileToDriveByPath(aiGenReplyFile, folderPath, attachmentName);
            }
            if (workspaceService === "circular") {
               if (circularMainFile) await uploadFileToDriveByPath(circularMainFile as File, folderPath, (circularMainFile as File).name);
               if (circularAtt1) await uploadFileToDriveByPath(circularAtt1 as File, folderPath, (circularAtt1 as File).name);
               if (circularAtt2) await uploadFileToDriveByPath(circularAtt2 as File, folderPath, (circularAtt2 as File).name);
               if (circularAtt3) await uploadFileToDriveByPath(circularAtt3 as File, folderPath, (circularAtt3 as File).name);
            }'''

content = content.replace(old_upload, new_upload)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
