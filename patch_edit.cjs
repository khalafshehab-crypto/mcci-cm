const fs = require('fs');

const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const handleOpenEditBlock = `    // Set Recommendation specific fields
    setNewRecTitle(evt.title || "");
    setNewRecType(evt.recommendationType || "");
    setNewRecClassification(evt.recommendationClassification || "");
    setNewRecEventId(evt.recommendationEventId || "");
    setNewRecPassMethod(evt.recommendationPassMethod || "عبر البريد الإلكتروني");
    setNewRecDiscussion(evt.recommendationDiscussion || "");
    setNewRecText(evt.recommendationText || evt.notes || "");
    setNewRecAssignee(evt.recommendationAssignee || (evt.employees && evt.employees[0]) || "");
    setNewRecDuration(evt.recommendationDuration || "");
    setNewRecAttachments(evt.recommendationAttachments || []);`;

  const newHandleOpenEditBlock = `    // Set Recommendation specific fields
    const isAgendaSource = evt.isAgendaSource || String(evt.id).startsWith("custom-rec-");
    let derivedEventId = evt.recommendationEventId || "";
    if (isAgendaSource && !derivedEventId) {
      const parts = String(evt.id).split("-");
      if (parts.length >= 3) {
        derivedEventId = parts[2];
      }
    }
    
    // Find committeeId from committeeName if missing (often missing in exported recommendations)
    let derivedCommitteeId = evt.committeeId || 0;
    if (!derivedCommitteeId && evt.committeeName) {
      const comm = committees.find(c => c.name === evt.committeeName);
      if (comm) {
        derivedCommitteeId = comm.id;
        setNewCommitteeId(comm.id);
      }
    }

    setNewRecTitle(evt.title || "");
    setNewRecType(evt.recommendationType || (isAgendaSource ? "عادية" : ""));
    setNewRecClassification(evt.recommendationClassification || (isAgendaSource ? "عادية" : ""));
    setNewRecEventId(derivedEventId);
    setNewRecPassMethod(evt.recommendationPassMethod || "عبر البريد الإلكتروني");
    setNewRecDiscussion(evt.recommendationDiscussion || evt.discussion || "");
    setNewRecText(evt.recommendationText || evt.description || evt.notes || "");
    
    // Try to get assignee properly
    let assigned = evt.recommendationAssignee || evt.assignedTo || (evt.employees && evt.employees[0]) || "";
    if (assigned === "غير محدد") assigned = "";
    setNewRecAssignee(assigned);
    
    let duration = evt.recommendationDuration || evt.duration || "";
    if (duration === "غير محدد") duration = "";
    setNewRecDuration(duration);
    
    setNewRecAttachments(evt.recommendationAttachments || evt.attachments || "");`;
    
  if (code.includes(handleOpenEditBlock)) {
    code = code.replace(handleOpenEditBlock, newHandleOpenEditBlock);
    fs.writeFileSync(filename, code);
    console.log("Patched CommitteesRecommendations.tsx (handleOpenEdit)");
  } else {
    console.log("handleOpenEditBlock not found in CommitteesRecommendations.tsx");
  }
}
