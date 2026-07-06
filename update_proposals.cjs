const fs = require('fs');

function patch(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const oldLogic = 'const generatedProposal = `الموضوع: تفعيل توصية رقم (001) الصادرة عن اجتماع ${evt.committeeName || "اللجنة الصناعية"} الأول (التأسيسي)\\nتوصية متسلسلة صادرة عن اجتماع ${evt.committeeName || "اللجنة الصناعية"} الدوري الأول (التأسيسي)\\nالمنعقد في تمام الساعة ${formatTime12h(evt.time || "01:30")} من ظهر يوم ${dayArabic} ${evt.date || "12/12/2026م"} بقاعة ${evt.location || "مشعل الزايدي"}\\nرقم التوصية: 001\\nالبند الأول: مراجعة محضر اجتماع اللجنة السابق\\nالمناقشة: ناقشت اللجنة إمكانية تفعيل التوصيات الاجتماعات السابقة\\nالتوصية: يتم مراجعة التوصيات الغير مفعلة لإعادة تفعيلها\\nالمكلف: أخصائي اللجنة - ${evt.employees && evt.employees[0] ? evt.employees[0] : "خلف شعبان"}\\nمدة التنفيذ: 5 أيام عمل\\nالمرفقات: ${attachmentsList.map((a: any) => a.name).join(", ") || "دراسة جدوى ومحضر الإعاشة"}`;';

    const newLogic = `const isPassing = evt.recommendationClassification === "بالتمرير";
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

    // Because oldLogic has \n characters, let's use a regex instead of string matching
    const regex = /const generatedProposal = `الموضوع: تفعيل توصية رقم \(001\) الصادرة عن اجتماع \$\{evt\.committeeName \|\| "اللجنة الصناعية"\} الأول \(التأسيسي\)[\s\S]*?مدة التنفيذ: 5 أيام عمل\\nالمرفقات: \$\{attachmentsList\.map\(\(a: any\) => a\.name\)\.join\(", "\) \|\| "دراسة جدوى ومحضر الإعاشة"\}؟`;/;
    
    content = content.replace(regex, newLogic);
    
    // Fallback: replace with strings directly if possible
    content = content.split('const generatedProposal = `الموضوع: تفعيل توصية رقم (001) الصادرة عن اجتماع ${evt.committeeName || "اللجنة الصناعية"} الأول (التأسيسي)').join('/* OLD LOGIC REPLACED */ const generatedProposal = `الموضوع: ...');
    
    // Actually the string replace with RegExp is safer. Let's do it with a Node AST or just find indices.
    
    fs.writeFileSync(filePath, content);
}

patch('src/pages/CommitteesRecommendations.tsx');
patch('src/pages/Recommendations.tsx');
