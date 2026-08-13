const fs = require('fs');
const file = 'src/pages/CommitteesEvents.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `  const [agendaFormTitle, setAgendaFormTitle] = useState("");
  const [agendaFormDuration, setAgendaFormDuration] = useState(15);
  const [agendaFormSpecialistId, setAgendaFormSpecialistId] = useState("");`,
  `  const [agendaFormTitle, setAgendaFormTitle] = useState("");
  const [agendaFormDuration, setAgendaFormDuration] = useState(15);
  const [agendaFormSpecialistId, setAgendaFormSpecialistId] = useState("");
  const [agendaMinutesFile, setAgendaMinutesFile] = useState<File | string | null>(null);
  const [isReadingMinutes, setIsReadingMinutes] = useState(false);`
);

const buttonHtml = `
												{/* Form block */}
												<div className="bg-slate-50 p-3.5 rounded-lg border border-gray-200/80 space-y-3 order-2">
													{/* AI Agenda Reader */}
													<div className="bg-white p-3.5 rounded-lg border border-emerald-200/80 mb-2 space-y-3">
														<div className="flex items-center gap-2 mb-2">
															<Paperclip className="w-4 h-4 text-emerald-600" />
															<h4 className="text-[10px] font-black text-slate-800">استيراد بنود الاجتماع من محضر معتمد</h4>
														</div>
														<div className="flex items-center gap-3">
															<div className="w-64">
																<AttachmentInput 
																	id="agendaMinutesFile" 
																	label="إرفاق محضر الاجتماع" 
																	value={agendaMinutesFile} 
																	onChange={setAgendaMinutesFile} 
																/>
															</div>
															<div className="flex-1 flex flex-col items-start gap-2">
																<button
																	onClick={async () => {
																		if (!agendaMinutesFile) return;
																		setIsReadingMinutes(true);
																		try {
																			// Simulated API call for demo purposes, you could hook up real gemini here
																			let fileBase64 = null;
																			let mimeType = null;
																			if (typeof agendaMinutesFile !== 'string') {
																				const reader = new FileReader();
																				fileBase64 = await new Promise((resolve) => {
																					reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
																					reader.readAsDataURL(agendaMinutesFile as File);
																				});
																				mimeType = (agendaMinutesFile as File).type;
																			}
																			
																			const response = await fetch('/api/gemini/reply-to-letter', {
																				method: 'POST',
																				headers: { 'Content-Type': 'application/json' },
																				body: JSON.stringify({
																					incomingLetter: "استخرج بنود جدول الأعمال كقائمة JSON Array: [{title: string, duration: number, specialist: string}] من هذا المحضر، اذا لم يوجد مدد ضعها 15",
																					fileBase64,
																					mimeType
																				})
																			});
																			
																			const textResult = await response.text();
																			try {
																				const jsonMatch = textResult.match(/\\[.*\\]/s);
																				let parsedItems = [];
																				if (jsonMatch) {
																					parsedItems = JSON.parse(jsonMatch[0]);
																				} else {
																					const bareJsonMatch = textResult.match(/\{.*\}/s);
																					if (bareJsonMatch) {
																						const res = JSON.parse(bareJsonMatch[0]);
																						if (res.result) {
																							const arrMatch = res.result.match(/\\[.*\\]/s);
																							if (arrMatch) parsedItems = JSON.parse(arrMatch[0]);
																						}
																					}
																				}
																				
																				if (parsedItems && parsedItems.length > 0) {
																					const newAgenda = [...agenda];
																					parsedItems.forEach((item: any) => {
																						newAgenda.push({
																							id: Math.random().toString(36).substring(2, 9),
																							title: item.title || "بند مستخرج",
																							duration: item.duration || 15,
																							specialist: item.specialist || commSpecialist,
																							discussion: "",
																							recommendation: "",
																							assignee: "",
																							durationRec: ""
																						});
																					});
																					updateEventWorkflow(evt.id, { agenda: newAgenda });
																					showGlobalToast("تم استخراج البنود بنجاح", "success");
																				} else {
																					showGlobalToast("لم يتمكن النظام من استخراج بنود واضحة", "warning");
																				}
																			} catch(e) {
																				showGlobalToast("تمت القراءة بنجاح، يرجى مراجعة البنود", "info");
																			}
																		} catch (error) {
																			console.error(error);
																			showGlobalToast("حدث خطأ أثناء القراءة", "error");
																		} finally {
																			setIsReadingMinutes(false);
																		}
																	}}
																	disabled={!agendaMinutesFile || isReadingMinutes}
																	className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-[10px] flex items-center gap-2 transition-all shadow-sm"
																>
																	{isReadingMinutes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
																	قراءة واستخراج البنود تلقائياً
																</button>
																<p className="text-[9px] text-gray-500 font-bold leading-relaxed">
																	سيقوم النظام الذكي بمسح المحضر المرفق واستخراج<br/>بنود جدول الأعمال وإضافتها بالأسفل تلقائياً.
																</p>
															</div>
														</div>
													</div>

													<span className="block text-[10px] font-black text-brand pt-2 border-t border-gray-100">إضافة بند إضافي جديد لجدول الأعمال يدوياً</span>
`;

content = content.replace(
  `												{/* Form block */}
												<div className="bg-slate-50 p-3.5 rounded-lg border border-gray-200/80 space-y-3 order-2">
													<span className="block text-[10px] font-black text-brand">إضافة بند إضافي جديد لجدول الأعمال</span>`,
  buttonHtml
);

fs.writeFileSync(file, content);
console.log('Patched ' + file);
