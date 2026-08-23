const fs = require('fs');

function modifyFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Remove the old copy and email buttons block from the top:
  const topButtonsRegex = /\{evt\.preparationsText\s*&&\s*\(\s*<div\s+key="filter-popover-1784704070975-5"[\s\S]*?<\/button>\s*<\/div>\s*\)\}/;
  content = content.replace(topButtonsRegex, '');

  // 2. We need to replace the 3 buttons I added previously with the new structure using the OLD logic.
  // We'll search for the whole block of 3 buttons and replace it.
  const oldMyButtonsRegex = /<button[\s\S]*?className="px-2\s+py-1\s+bg-slate-900\s+border-transparent[\s\S]*?المولد الذكي للتوصيات[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?className="px-2\s+py-1\s+bg-slate-100[\s\S]*?نسخ[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?className="px-2\s+py-1\s+bg-slate-100[\s\S]*?البريد الإلكتروني[\s\S]*?<\/button>/;

  const newButtons = `<button
                                                    type="button"
                                                    onClick={() => {
                                                        const dayArabic = getDayNameFromDate(evt.date) || "الاثنين";
                                                        const isPassing = evt.recommendationClassification === "بالتمرير";
                                                        const rType = evt.recommendationType === "عاجلة" ? "عاجلة" : "عادية";
                                                        const attachmentsText = attachmentsList && attachmentsList.length > 0 ? attachmentsList.map((a) => a.name).join(", ") : "لا يوجد مرفقات";
                                                        const linkedEvent = events.find(e => String(e.id) === String(evt.recommendationEventId));
                                                        const meetingName = linkedEvent ? linkedEvent.title : (evt.eventName && evt.eventName !== "توصية غير محددة" ? evt.eventName : (evt.title.includes("اجتماع") ? evt.title : \`اجتماع \${evt.committeeName || "اللجنة"}\`));
                                                        const eventTime = linkedEvent?.time || evt.time || "……";
                                                        const eventLocation = linkedEvent?.location || evt.location || "……";
                                                        const dateStr = linkedEvent?.date || evt.date || "……";
                                                        let formattedTime = eventTime;
                                                        if (eventTime && eventTime !== "……") {
                                                            const [hours, minutes] = eventTime.split(":");
                                                            if (hours && minutes) {
                                                              let h = parseInt(hours, 10);
                                                              const ampm = h >= 12 ? "مساءً" : "صباحاً";
                                                              h = h % 12;
                                                              h = h ? h : 12;
                                                              formattedTime = \`\${h}:\${minutes} \${ampm}\`;
                                                            }
                                                        }
                                                        let formattedDate = dateStr;
                                                        if (dateStr && dateStr !== "……") {
                                                            const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
                                                            const d = new Date(dateStr);
                                                            if (!isNaN(d.getTime())) {
                                                                const dayStr = d.getDate().toString().padStart(2, '0');
                                                                const monthStr = months[d.getMonth()];
                                                                const yearStr = d.getFullYear();
                                                                formattedDate = \`\${dayStr} \${monthStr} \${yearStr}م\`;
                                                            }
                                                        }
                                                        let itemTitle = "……";
                                                        let itemTitleFull = "البند: ……";
                                                        let itemDiscussion = evt.recommendationDiscussion || "……";
                                                        let itemRec = evt.description || evt.recommendationText || evt.notes || "لا يوجد نص للتوصية";
                                                        if (linkedEvent && linkedEvent.agenda) {
                                                            const agendaIdx = linkedEvent.agenda.findIndex((a: any) => evt.title && evt.title.includes(a.title));
                                                            if (agendaIdx !== -1) {
                                                                const agendaItem = linkedEvent.agenda[agendaIdx];
                                                                itemTitle = agendaItem.title;
                                                                itemTitleFull = \`البند \${getArabicOrdinalGlobal(agendaIdx + 1)}: \${itemTitle}\`;
                                                                itemDiscussion = agendaItem.discussion || "……";
                                                                itemRec = agendaItem.recommendation || itemRec;
                                                            } else {
                                                               const match = evt.title?.match(/توصية البند (.*?) "(.*?)"/);
                                                               if (match) {
                                                                   itemTitle = match[2];
                                                                   itemTitleFull = \`البند \${match[1]}: \${match[2]}\`;
                                                               } else {
                                                                   itemTitle = evt.title || "……";
                                                                   itemTitleFull = \`البند: \${itemTitle}\`;
                                                               }
                                                            }
                                                        } else {
                                                            const match = evt.title?.match(/توصية البند (.*?) "(.*?)"/);
                                                            if (match) {
                                                                itemTitle = match[2];
                                                                itemTitleFull = \`البند \${match[1]}: \${match[2]}\`;
                                                            } else {
                                                                itemTitle = evt.title || "……";
                                                                itemTitleFull = \`البند: \${itemTitle}\`;
                                                            }
                                                        }
                                                        let assigneeText = evt.assignedTo || evt.recommendationAssignee || (evt.employees && evt.employees.length > 0 ? evt.employees[0] : "غير محدد");
                                                        if (assigneeText === "الأخصائي" || assigneeText === "أخصائي اللجنة") {
                                                            const committeeIdMatch = evt.committeeId || (events.find(e => String(e.id) === String(evt.recommendationEventId))?.committeeId);
                                                            const comm = committees.find(c => c.name === evt.committeeName || (committeeIdMatch && String(c.id) === String(committeeIdMatch)));
                                                            if (comm && comm.specialist) {
                                                                assigneeText = \`أخصائي اللجنة: \${comm.specialist}\`;
                                                            }
                                                        }
                                                        let attachmentsLabel = attachmentsText;
                                                        if (attachmentsList && attachmentsList.length > 0) {
                                                            attachmentsLabel = attachmentsList.map((a: any) => a.name).join("، ");
                                                        } else {
                                                            attachmentsLabel = "لا يوجد مرفقات";
                                                        }
                                                        const subjectPrefix = (evt.isImportant && evt.isUrgent) ? "(هام وعاجل) " : (evt.isImportant ? "(هام) " : (evt.isUrgent ? "(عاجل) " : ""));
                                                        const subjectText = \`\${subjectPrefix}تفعيل توصية \${itemTitleFull} ل\${meetingName}\`;
                                                        let closureText = "آمل من سعادتكم التكرم بالاطلاع والتوجيه حتى يتسنى لنا إكمال اللازم.";
                                                        if (evt.impactType === "آجل") {
                                                            closureText = "آمل من سعادتكم التكرم بالاطلاع للعلم والإحاطة.";
                                                        }
                                                        const generatedProposal = \`الموضوع: \${subjectText}

سعادة الأستاذ/ محمد بن محسن السبيعي                 سلمه الله
رئيس قسم اللجان
السلام عليكم ورحمه الله وبركاته .. وبعد
نهديكم أطيب تحية وتقدير.. ونشكر لسعادتكم تعاونكم الدائم والمستمر لإنجاح سير أعمال إدارة اللجان.
إشارة إلى \${meetingName} الذي تم عقده في تمام الساعة \${formattedTime} من ظهر يوم \${dayArabic} بتاريخ \${formattedDate} بقاعة/ \${eventLocation}  بمقر غرفة مكة المكرمة، وما ورد به من:
\${itemTitleFull} .
المناقشة: \${itemDiscussion} .
التوصية: \${itemRec} .
المكلف: \${assigneeText} .
المرفقات: \${attachmentsLabel} .

\${closureText}

شاكرين ومقدرين لسعادتكم حسن تعاونكم..
وتفضلوا بقبول وافر التحية والتقدير،،،\`;
                                                                                                              
                                                        updateEventWorkflow(evt.id, { preparationsText: generatedProposal });
                                                    }}
                                                    className="px-2 py-1 bg-slate-900 border-transparent hover:bg-slate-800 text-brand rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow transition-all duration-200 animate-pulse font-sans text-[9px] font-black"
                                                    title="توليد النص المقترح بناءً على نوع التوصية"
                                                  >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    المولد الذكي للتوصيات
                                                  </button>
                                                  
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                        const text = evt.preparationsText || evt.description || evt.recommendationText || "";
                                                        if(text) {
                                                            try { navigator.clipboard.writeText(text); setAlertState({ isOpen: true, message: "تم نسخ الصياغة المقترحة بنجاح!", onClose: () => {} }); } catch(e) {}
                                                        } else {
                                                            alert("الرجاء توليد النص أولاً");
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-slate-100 border border-gray-200 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 font-sans text-[9px] font-black"
                                                    title="نسخ نص التوصية"
                                                  >
                                                    <Copy className="w-3.5 h-3.5" />
                                                    نسخ
                                                  </button>
                                                  
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!evt.preparationsText) {
                                                            alert("الرجاء توليد النص أولاً");
                                                            return;
                                                        }
                                                        let mailSubject = \`تفعيل \${evt.title || "توصية قطاعية"}\`;
                                                        let mailBody = evt.preparationsText || "";
                                                        if (mailBody.includes("سعادة")) {
                                                            mailBody = mailBody.substring(mailBody.indexOf("سعادة"));
                                                        } else if (mailBody.startsWith("الموضوع: ")) {
                                                            const firstLineEnd = mailBody.indexOf("\\n");
                                                            if (firstLineEnd !== -1) {
                                                                mailBody = mailBody.substring(firstLineEnd + 1).trim();
                                                            }
                                                        }
                                                        
                                                        const atts = evt.attachments || [];
                                                        
                                                        let allAtts = [...atts];
                                                        if (evt.approvedMinutesUrl && typeof evt.approvedMinutesUrl === 'string') {
                                                            if (!allAtts.some(a => a.url === evt.approvedMinutesUrl)) {
                                                                 allAtts.push({ name: 'محضر الاجتماع المعتمد', url: evt.approvedMinutesUrl });
                                                            }
                                                        }
                                                        if (evt.agendaMinutes && typeof evt.agendaMinutes === 'string') {
                                                            if (!allAtts.some(a => a.url === evt.agendaMinutes)) {
                                                                 allAtts.push({ name: 'محضر الاجتماع المعتمد', url: evt.agendaMinutes });
                                                            }
                                                        }
                                                        if (allAtts.length > 0) {
                                                            mailBody += "\\n\\nالمرفقات:\\n";
                                                            allAtts.forEach((a, idx) => {
                                                                mailBody += \`\${idx + 1}- \${a.name || "مرفق"}: \${a.url || ""}\\n\`;
                                                            });
                                                        }
                                                        const fullUrl = \`https://mail.google.com/mail/?view=cm&fs=1&su=\${encodeURIComponent(mailSubject)}&body=\${encodeURIComponent(mailBody)}\`;
                                                        
                                                        if (fullUrl.length > 7500) {
                                                            navigator.clipboard.writeText(mailBody).then(() => {
                                                                showGlobalToast("نظراً لطول محتوى الرسالة، تم نسخ المحتوى للحافظة. يرجى الضغط على لصق (Ctrl+V) في مساحة النص بالبريد.", "success");
                                                                setTimeout(() => {
                                                                    const a = document.createElement('a');
                                                                    a.href = \`https://mail.google.com/mail/?view=cm&fs=1&su=\${encodeURIComponent(mailSubject)}&body=\`;
                                                                    a.target = '_blank';
                                                                    a.rel = 'noopener noreferrer';
                                                                    a.click();
                                                                }, 2000);
                                                            });
                                                        } else {
                                                            const a = document.createElement('a');
                                                            a.href = fullUrl;
                                                            a.target = '_blank';
                                                            a.rel = 'noopener noreferrer';
                                                            a.click();
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer flex items-center justify-center transition-all border border-gray-200 font-sans text-[9px] font-black gap-1.5"
                                                    title="إرسال عبر البريد الإلكتروني"
                                                  >
                                                    <Mail className="w-3.5 h-3.5" />
                                                    البريد الإلكتروني
                                                  </button>`;

  content = content.replace(oldMyButtonsRegex, newButtons);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Modified ${filePath}`);
}

modifyFile('src/pages/CommitteesRecommendations.tsx');
modifyFile('src/pages/Recommendations.tsx');
