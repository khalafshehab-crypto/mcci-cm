const fs = require('fs');

const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `            agendaRecs.push({
              id: \`custom-rec-\${evt.id}-\${item.id || index}\`,
              title: \`توصية البند \${getArabicOrdinalGlobal(index + 1)} "\${item.title}"\`,
              description: item.recommendation,
              recommendationText: item.recommendation,
              committeeName: evt.committeeName || "لجنة غير محددة",
              eventName: evt.title,
              date: evt.date || "2026-06-11",
              status: "جديدة",
              approvalStage: "أخصائي",
              assignedTo: item.assignee || "غير محدد",
              duration: item.durationRec || "أسبوعين",
              isAgendaSource: true
            });`;
            
  const newText = `            agendaRecs.push({
              id: \`custom-rec-\${evt.id}-\${item.id || index}\`,
              title: \`توصية البند \${getArabicOrdinalGlobal(index + 1)} "\${item.title}"\`,
              description: item.recommendation,
              recommendationText: item.recommendation,
              committeeName: evt.committeeName || "لجنة غير محددة",
              eventName: evt.title,
              date: evt.date || "2026-06-11",
              time: evt.time || "",
              location: evt.location || "",
              recommendationEventId: evt.id,
              status: "جديدة",
              approvalStage: "أخصائي",
              assignedTo: item.assignee || "غير محدد",
              duration: item.durationRec || "أسبوعين",
              isAgendaSource: true
            });`;

  if (code.includes(target)) {
    code = code.replace(target, newText);
    fs.writeFileSync(filename, code);
    console.log("Patched agendaRecs.push");
  } else {
    console.log("agendaRecs.push target not found");
  }
}
