const fs = require('fs');

['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'].forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');

  // 1. In the outer card, replace المكلف with رقم الاجتماع
  const oldAssigneeDiv = /<div className="flex items-center gap-2 text-brand">\s*<Users className="w-3\.5 h-3\.5" \/>\s*<span>المكلف: \{evt\.recommendationAssignee \|\| \(evt\.employees && evt\.employees\[0\]\) \|\| "غير محدد"\}<\/span>\s*<\/div>/g;
  const newMeetingDiv = `<div className="flex items-center gap-2 text-brand">
                                <List className="w-3.5 h-3.5" />
                                <span>الاجتماع: {evt.eventName || "توصية مباشرة"}</span>
                              </div>`;
  content = content.replace(oldAssigneeDiv, newMeetingDiv);

  // 2. In the inner card (status), add the assignee under "توصية جديدة"
  const oldStatusDiv = /<span className=\{\`inline-flex items-center px-2\.5 py-1 text-\[11px\] font-black rounded-lg border \$\{badgeBg\}\`\}>\s*\{statusTextLabel\}\s*<\/span>/g;
  const newStatusDiv = `<div className="flex flex-col gap-1">
                                    <span className={\`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-black rounded-lg border \${badgeBg}\`}>
                                      {statusTextLabel}
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-bold bg-white/50 px-2 py-0.5 rounded border border-gray-200 text-center">
                                      المكلف: {rec.assignedTo || rec.recommendationAssignee || (rec.employees && rec.employees[0]) || "غير محدد"}
                                    </span>
                                  </div>`;
  content = content.replace(oldStatusDiv, newStatusDiv);

  // Also in the generated proposal text, let's just make it the text itself if they click "توليد الصياغة الفنية الذكية"?
  // Wait, the user said: "اضغط على الإجراءات لتجهيز صياغة التوصية والمسودة يكون النص (فوز شعبان بالرئاسة)"
  // So when they open "تجهيز التوصية والمسودة", the textarea should just be the recommendation text.
  // I already did: value={evt.preparationsText || evt.description || evt.recommendationText || ""}
  // I will also change the generator button to just set it to `evt.description || evt.recommendationText` if they want.
  // Actually, if the text area ALREADY has the recommendation text, the user doesn't need to click anything.
  // But let's change the generated text to just the recommendation text if they want it simple.
  
  const oldGenerated = /const generatedProposal = isPassing[\s\S]*?مدة التنفيذ: 5 أيام عمل\\nالمرفقات: \$\{attachmentsText\}\`;/m;
  const newGenerated = `const generatedProposal = evt.description || evt.recommendationText || evt.notes || "لا يوجد نص للتوصية";`;
  content = content.replace(oldGenerated, newGenerated);

  fs.writeFileSync(filepath, content, 'utf8');
});
console.log('Fixed card layouts');
