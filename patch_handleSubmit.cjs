const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf-8');

const handleEditBlock = `    if (editingEvent) {
      const updatedRec = {
        ...editingEvent,
        title: newRecTitle,
        committeeId: newCommitteeId,
        committeeName: commName,
        employees: [newRecAssignee].filter(Boolean),
        notes: newRecText,
        
        recommendationType: newRecType,
        recommendationClassification: newRecClassification,
        recommendationEventId: newRecEventId,
        recommendationPassMethod: newRecPassMethod,
        recommendationDiscussion: newRecDiscussion,
        recommendationText: newRecText,
        recommendationAssignee: newRecAssignee,
        recommendationDuration: newRecDuration,
        recommendationAttachments: newRecAttachments,
        
        preparationsText: newRecText,
        preparationsAttachments: newRecAttachments ? [{ id: '1', name: newRecAttachments, url: '#' }] : (editingEvent.preparationsAttachments || [])
      };
      setEvents(events.map(ev => ev.id === editingEvent.id ? updatedRec : ev));
    } else {`;

const newHandleEditBlock = `    if (editingEvent) {
      const updatedRec = {
        ...editingEvent,
        title: newRecTitle,
        committeeId: newCommitteeId,
        committeeName: commName,
        employees: [newRecAssignee].filter(Boolean),
        notes: newRecText,
        
        recommendationType: newRecType,
        recommendationClassification: newRecClassification,
        recommendationEventId: newRecEventId,
        recommendationPassMethod: newRecPassMethod,
        recommendationDiscussion: newRecDiscussion,
        recommendationText: newRecText,
        recommendationAssignee: newRecAssignee,
        recommendationDuration: newRecDuration,
        recommendationAttachments: newRecAttachments,
        
        preparationsText: newRecText,
        preparationsAttachments: newRecAttachments ? [{ id: '1', name: newRecAttachments, url: '#' }] : (editingEvent.preparationsAttachments || [])
      };
      
      if (editingEvent.isAgendaSource || String(editingEvent.id).startsWith("custom-rec-")) {
        // Save to Firebase for agenda exported recommendations
        addFirebaseRecommendation(updatedRec);
      } else {
        // Save to local context for standalone recommendations
        setEvents(events.map(ev => ev.id === editingEvent.id ? updatedRec : ev));
      }
    } else {`;

code = code.replace(handleEditBlock, newHandleEditBlock);

fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', code);
console.log("Done patching handleSubmit");
