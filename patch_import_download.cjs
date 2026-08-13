const fs = require('fs');
const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /uploadBinaryFileToDrive \} from "\.\.\/lib\/googleApi";/,
    'uploadBinaryFileToDrive, downloadDriveFileBase64 } from "../lib/googleApi";'
  );
  
  const extractCall = `																			let fileBase64 = null;
																			let mimeType = null;
																			if (typeof agendaMinutesFile !== 'string') {
																				const reader = new FileReader();
																				fileBase64 = await new Promise((resolve) => {
																					reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
																					reader.readAsDataURL(agendaMinutesFile as File);
																				});
																				mimeType = (agendaMinutesFile as File).type;
																			}`;
																			
  const newExtractCall = `																			let fileBase64 = null;
																			let mimeType = null;
																			let docName = "محضر_مستورد.pdf";
																			if (typeof agendaMinutesFile === 'string') {
																				try {
																					showGlobalToast("جاري تنزيل المحضر من جوجل درايف...", "success");
																					const driveData = await downloadDriveFileBase64(agendaMinutesFile);
																					fileBase64 = driveData.base64;
																					mimeType = driveData.mimeType;
																					docName = "محضر_مستورد_من_رابط.pdf";
																				} catch (e) {
																					console.error(e);
																					showGlobalToast("لم نتمكن من تنزيل الملف من الرابط، تأكد من الصلاحيات", "error");
																					setIsReadingMinutes(false);
																					return;
																				}
																			} else {
																				const reader = new FileReader();
																				fileBase64 = await new Promise((resolve) => {
																					reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
																					reader.readAsDataURL(agendaMinutesFile as File);
																				});
																				mimeType = (agendaMinutesFile as File).type;
																				docName = "محضر_مستورد_" + (agendaMinutesFile as File).name;
																			}`;
																			
  content = content.replace(extractCall, newExtractCall);
  
  // also fix uploadBinaryFileToDrive
  const oldUpload = `await uploadBinaryFileToDrive(
                                                                                        "محضر_مستورد_" + (agendaMinutesFile as File).name,
                                                                                        fileBase64 as string,
                                                                                        mimeType || "application/pdf",
                                                                                        folderId
                                                                                    );`;
  const newUpload = `await uploadBinaryFileToDrive(
                                                                                        docName,
                                                                                        fileBase64 as string,
                                                                                        mimeType || "application/pdf",
                                                                                        folderId
                                                                                    );`;
  content = content.replace(oldUpload, newUpload);
  
  // Wait, there's a conditional: if (folderId && typeof agendaMinutesFile !== 'string')
  // Let's remove the condition for string so it uploads even if it's imported from Drive!
  // actually wait, if it's already in Drive, maybe we don't need to re-upload it?
  // User asked: "بالإضافة أنه عندما يتم إرفاق محضر الاجتماع في (استيراد بنود الاجتماع من محضر معتمد) يقوم النظام تلقائياً بأرشفة المحضر في جوجل درايف بناء على المسار الذكي داخل الاجتماع"
  // If they provided a URL, it's ALREADY in Drive. We might want to move or copy it, but re-uploading the downloaded PDF is also fine. Let's just re-upload it.
  
  content = content.replace(
    /if \(folderId && typeof agendaMinutesFile !== 'string'\) \{/,
    'if (folderId) {'
  );
  
  fs.writeFileSync(file, content);
  console.log('Patched ' + file);
}
