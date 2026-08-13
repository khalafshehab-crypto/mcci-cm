const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  const badCall = `await uploadBinaryFileToDrive(
                                                                                        agendaMinutesFile as File,
                                                                                        "محضر_مستورد_" + (agendaMinutesFile as File).name,
                                                                                        folderId,
                                                                                        mimeType || "application/pdf"
                                                                                    );`;
                                                                                    
  const goodCall = `await uploadBinaryFileToDrive(
                                                                                        "محضر_مستورد_" + (agendaMinutesFile as File).name,
                                                                                        fileBase64 as string,
                                                                                        mimeType || "application/pdf",
                                                                                        folderId
                                                                                    );`;
                                                                                    
  content = content.replace(badCall, goodCall);
  fs.writeFileSync(file, content);
  console.log("Fixed upload call in " + file);
}
