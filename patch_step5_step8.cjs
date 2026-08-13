const fs = require('fs');
const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  const oldBlock = `                                                                            // Auto-archive in Google Drive
                                                                            try {
                                                                                const folderId = await autoCreateEventDriveFolders(evt, []);
                                                                                if (folderId) {
                                                                                    await uploadBinaryFileToDrive(
                                                                                        docName,
                                                                                        fileBase64 as string,
                                                                                        mimeType || "application/pdf",
                                                                                        folderId
                                                                                    );
                                                                                    showGlobalToast("تم أرشفة المحضر في جوجل درايف بنجاح", "success");
                                                                                }
                                                                            } catch (uploadErr) {
                                                                                console.error("Drive auto-archive failed:", uploadErr);
                                                                            }`;
                                                                            
  const newBlock = `                                                                            // Auto-archive in Google Drive
                                                                            try {
                                                                                const folderId = await autoCreateEventDriveFolders(evt, []);
                                                                                if (folderId) {
                                                                                    const res = await uploadBinaryFileToDrive(
                                                                                        docName,
                                                                                        fileBase64 as string,
                                                                                        mimeType || "application/pdf",
                                                                                        folderId
                                                                                    );
                                                                                    if (res && res.id) {
                                                                                        const fileUrl = \`https://drive.google.com/file/d/\${res.id}/view\`;
                                                                                        updateEventWorkflow(evt.id, { approvedMinutesUrl: fileUrl });
                                                                                    }
                                                                                    showGlobalToast("تم استيراد المحضر وأرشفته واعتماده في المرفقات بنجاح", "success");
                                                                                }
                                                                            } catch (uploadErr) {
                                                                                console.error("Drive auto-archive failed:", uploadErr);
                                                                            }`;

  if (content.includes("await uploadBinaryFileToDrive(")) {
     content = content.replace(oldBlock, newBlock);
     fs.writeFileSync(file, content);
     console.log("Patched " + file);
  } else {
     console.log("Could not find block in " + file);
  }
}
