const fs = require('fs');

const replacement = `                                                      const dayArabic = getDayNameFromDate(evt.date) || "الاثنين";
                                                      const isPassing = evt.recommendationClassification === "بالتمرير";
                                                      const rType = evt.recommendationType === "عاجلة" ? "عاجلة" : "عادية";
                                                      const attachmentsText = attachmentsList && attachmentsList.length > 0 ? attachmentsList.map((a) => a.name).join(", ") : "لا يوجد مرفقات";
                                                      const generatedProposal = isPassing 
                                                        ? \`الموضوع: تفعيل التوصية رقم (001) الصادرة بالتمرير لـ \${evt.committeeName || "اللجنة"}

توصية \${rType} صادرة بالتمرير لـ \${evt.committeeName || "اللجنة"}
تم تمريرها بتاريخ \${dayArabic} \${evt.date || "12/12/2026م"} عبر \${evt.recommendationPassMethod || "البريد الإلكتروني"}

رقم التوصية: 001
البند الأول: \${evt.title || "موضوع التوصية"}
المناقشة: \${evt.recommendationDiscussion || "تمت مناقشة التوصية وإبداء الآراء والملاحظات من قبل الأعضاء"}
التوصية: \${evt.recommendationText || "يتم اعتماد التوصية والبدء بتنفيذها"}
المكلف: أخصائي اللجنة - \${evt.employees && evt.employees[0] ? evt.employees[0] : "خلف شعبان"}
مدة التنفيذ: 5 أيام عمل
المرفقات: \${attachmentsText}\` 
                                                        : \`الموضوع: تفعيل التوصية رقم (001) الصادرة عن اجتماع \${evt.committeeName || "اللجنة"}

توصية \${rType} صادرة عن اجتماع \${evt.committeeName || "اللجنة"}
المنعقد في تمام الساعة \${formatTime12h(evt.time || "01:30")} من ظهر يوم \${dayArabic} \${evt.date || "12/12/2026م"} بقاعة \${evt.location || "الاجتماعات"}

رقم التوصية: 001
البند الأول: \${evt.title || "موضوع التوصية"}
المناقشة: \${evt.recommendationDiscussion || "ناقشت اللجنة إمكانية تفعيل التوصيات"}
التوصية: \${evt.recommendationText || "يتم مراجعة التوصيات الغير مفعلة لإعادة تفعيلها"}
المكلف: أخصائي اللجنة - \${evt.employees && evt.employees[0] ? evt.employees[0] : "خلف شعبان"}
مدة التنفيذ: 5 أيام عمل
المرفقات: \${attachmentsText}\`;`;

function replaceLines(filePath, start, end) {
    let lines = fs.readFileSync(filePath, 'utf8').split('\n');
    lines.splice(start - 1, end - start + 1, replacement);
    fs.writeFileSync(filePath, lines.join('\n'));
}

replaceLines('src/pages/CommitteesRecommendations.tsx', 2469, 2480);
replaceLines('src/pages/Recommendations.tsx', 2466, 2477);
