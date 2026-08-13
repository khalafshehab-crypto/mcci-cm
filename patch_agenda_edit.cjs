const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Add editingAgendaItemId state
  content = content.replace(
    /const \[agendaFormSpecialistId, setAgendaFormSpecialistId\] = useState\(""\);/,
    `const [agendaFormSpecialistId, setAgendaFormSpecialistId] = useState("");
  const [editingAgendaItemId, setEditingAgendaItemId] = useState<string | null>(null);`
  );

  // 2. Add Settings (gear) import if not present (it's already imported, I can use Settings2 or Settings).
  // Wait, I will just use Settings or Edit2. The user said "علامة الترس" which is Settings.

  // 3. Update table headers "مسح" -> "الإجراء"
  content = content.replace(
    /<th className="whitespace-nowrap px-3 py-2 text-center w-16">مسح<\/th>/g,
    '<th className="whitespace-nowrap px-3 py-2 text-center w-24">الإجراء</th>'
  );

  // 4. Update the Action td
  const oldTdStr = `<td className="whitespace-nowrap px-3 py-2 text-center">
																				<button
																					type="button"
																					onClick={() => handleRemoveAgendaItem(item.id)}
																					className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer transition-colors"
																				>
																					<Trash2 className="w-3.5 h-3.5" />
																				</button>
																			</td>`;
  const newTdStr = `<td className="whitespace-nowrap px-3 py-2 text-center">
																				<div className="flex items-center justify-center gap-2">
																					<button
																						type="button"
																						onClick={() => {
																							setAgendaFormTitle(item.title);
																							setAgendaFormDuration(item.duration);
																							setAgendaFormSpecialistId(item.specialist || "");
																							setEditingAgendaItemId(item.id);
																						}}
																						className="text-blue-600 hover:bg-blue-50 p-1 rounded cursor-pointer transition-colors"
																						title="تحرير البند"
																					>
																						<Settings className="w-3.5 h-3.5" />
																					</button>
																					<button
																						type="button"
																						onClick={() => handleRemoveAgendaItem(item.id)}
																						className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer transition-colors"
																						title="حذف"
																					>
																						<Trash2 className="w-3.5 h-3.5" />
																					</button>
																				</div>
																			</td>`;
  
  // Replace the old td with the new one. (We need to use regex because indentation might vary)
  const regexTd = /<td className="whitespace-nowrap px-3 py-2 text-center">\s*<button\s*type="button"\s*onClick=\{\(\) => handleRemoveAgendaItem\(item\.id\)\}\s*className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer transition-colors"\s*>\s*<Trash2 className="w-3\.5 h-3\.5" \/>\s*<\/button>\s*<\/td>/s;
  
  if (regexTd.test(content)) {
    content = content.replace(regexTd, newTdStr);
  } else {
    console.log("Could not find the TRASH button TD in " + file);
  }
  
  // 5. Update handleAddAgendaItem logic
  const oldHandleAdd = `const handleAddAgendaItem = () => {
											if (!agendaFormTitle.trim()) return;
											
											const newItem = {
												id: Math.random().toString(36).substring(2, 9),
												title: agendaFormTitle.trim(),
												duration: Number(agendaFormDuration) || 15,
												specialist: agendaFormSpecialistId || commSpecialist,
												discussion: "",
												recommendation: "",
												assignee: "",
												durationRec: ""
											};
											
											updateEventWorkflow(evt.id, { agenda: [...agenda, newItem] });
											setAgendaFormTitle("");
											setAgendaFormSpecialistId("");
										};`;
										
  const newHandleAdd = `const handleAddAgendaItem = () => {
											if (!agendaFormTitle.trim()) return;
											
											if (editingAgendaItemId) {
												const updatedAgenda = agenda.map(item => 
													item.id === editingAgendaItemId 
														? { ...item, title: agendaFormTitle.trim(), duration: Number(agendaFormDuration) || 15, specialist: agendaFormSpecialistId || commSpecialist }
														: item
												);
												updateEventWorkflow(evt.id, { agenda: updatedAgenda });
												setEditingAgendaItemId(null);
											} else {
												const newItem = {
													id: Math.random().toString(36).substring(2, 9),
													title: agendaFormTitle.trim(),
													duration: Number(agendaFormDuration) || 15,
													specialist: agendaFormSpecialistId || commSpecialist,
													discussion: "",
													recommendation: "",
													assignee: "",
													durationRec: ""
												};
												updateEventWorkflow(evt.id, { agenda: [...agenda, newItem] });
											}
											setAgendaFormTitle("");
											setAgendaFormSpecialistId("");
										};`;
  
  content = content.replace(oldHandleAdd, newHandleAdd);
  
  // 6. Update the Add Button text based on editing state
  const oldBtnText = `إدراج البند إلى جدول فعاليات الأعمال بالأسفل`;
  const newBtnText = `{editingAgendaItemId ? "حفظ التعديلات" : "إدراج البند إلى جدول فعاليات الأعمال بالأسفل"}`;
  
  content = content.replace(oldBtnText, newBtnText);
  
  // 7. Auto-archive Drive Upload logic
  const fetchBlockRegex = /const responseData = await response\.json\(\);\s*const aiText = responseData\.result \|\| "";/s;
  
  if (fetchBlockRegex.test(content)) {
    const uploadLogic = `
                                                                            // Auto-archive in Google Drive
                                                                            try {
                                                                                const folderId = await autoCreateEventDriveFolders(evt, []);
                                                                                if (folderId && typeof agendaMinutesFile !== 'string') {
                                                                                    await uploadBinaryFileToDrive(
                                                                                        agendaMinutesFile as File,
                                                                                        "محضر_مستورد_" + (agendaMinutesFile as File).name,
                                                                                        folderId,
                                                                                        mimeType || "application/pdf"
                                                                                    );
                                                                                    showGlobalToast("تم أرشفة المحضر في جوجل درايف بنجاح", "success");
                                                                                }
                                                                            } catch (uploadErr) {
                                                                                console.error("Drive auto-archive failed:", uploadErr);
                                                                            }
                                                                            
                                                                            const responseData = await response.json();
                                                                            const aiText = responseData.result || "";`;
    content = content.replace(fetchBlockRegex, uploadLogic);
  } else {
    console.log("Could not find the fetch block in " + file);
  }
  
  fs.writeFileSync(file, content);
  console.log("Patched " + file);
}
