const fs = require('fs');

const filename = 'src/pages/CommitteesRecommendations.tsx';
if (fs.existsSync(filename)) {
  let code = fs.readFileSync(filename, 'utf-8');
  
  const target = `  // Helper to update specific event workflow fields and commit to parent and localStorage
  const updateEventWorkflow = (eventId: number, updates: Partial<EventItem>) => {
    const targetEvent = events.find(e => String(e.id) === String(eventId));
    if (targetEvent && !canUserEditCommittee(targetEvent.committeeName)) {
      setAlertState({ isOpen: true, message: "عذراً، لا تملك الصلاحية لتعديل فعاليات هذه اللجنة. يمكنك فقط إدارة فعاليات اللجان المكلف بها.", onClose: () => {} });
      return;
    }
    setEvents(prev => prev.map(evt => {
      if (String(evt.id) === String(eventId)) {
        const updated = { ...evt, ...updates };
        
        // Dynamic Quorum side-effect: automatically check if quorum is met and update status
        if ('confirmedAttendees' in updates) {
          const commMems = allMembers.filter(m => m.committeeId === updated.committeeId && m.active !== false);
          const presentIds = updates.confirmedAttendees || [];
          const presentMems = commMems.filter(m => presentIds.includes(m.id));
          const ratioMet = commMems.length > 0 ? (presentMems.length >= (commMems.length / 2)) : false;
          const leadersPresent = presentMems.some(m => m.role === "رئيس" || m.role === "نائب" || m.role?.includes("رئيس") || m.role?.includes("نائب") || m.role?.includes("أمين"));
          const quorumMet = ratioMet && leadersPresent;
          
          if (quorumMet) {
            updated.status = "مؤكد";
          } else {
            updated.status = "تأكيد الحضور";
          }
        }
        return updated;
      }
      return evt;
    }));
  };`;

  const newFunction = `  // Helper to update specific event workflow fields and commit to parent and localStorage
  const updateEventWorkflow = (eventId: any, updates: Partial<any>) => {
    if (String(eventId).startsWith("custom-rec-")) {
      const dbRec = allDbRecommendations.find(r => String(r.id) === String(eventId));
      if (dbRec) {
        updateFirebaseRecommendation(String(eventId), { ...dbRec, ...updates });
      }
      return;
    }
    
    const targetEvent = events.find(e => String(e.id) === String(eventId));
    if (targetEvent && !canUserEditCommittee(targetEvent.committeeName)) {
      setAlertState({ isOpen: true, message: "عذراً، لا تملك الصلاحية لتعديل فعاليات هذه اللجنة. يمكنك فقط إدارة فعاليات اللجان المكلف بها.", onClose: () => {} });
      return;
    }
    setEvents(prev => prev.map(evt => {
      if (String(evt.id) === String(eventId)) {
        const updated = { ...evt, ...updates };
        
        // Dynamic Quorum side-effect: automatically check if quorum is met and update status
        if ('confirmedAttendees' in updates) {
          const commMems = allMembers.filter(m => m.committeeId === updated.committeeId && m.active !== false);
          const presentIds = updates.confirmedAttendees || [];
          const presentMems = commMems.filter(m => presentIds.includes(m.id));
          const ratioMet = commMems.length > 0 ? (presentMems.length >= (commMems.length / 2)) : false;
          const leadersPresent = presentMems.some(m => m.role === "رئيس" || m.role === "نائب" || m.role?.includes("رئيس") || m.role?.includes("نائب") || m.role?.includes("أمين"));
          const quorumMet = ratioMet && leadersPresent;
          
          if (quorumMet) {
            updated.status = "مؤكد";
          } else {
            updated.status = "تأكيد الحضور";
          }
        }
        return updated;
      }
      return evt;
    }));
  };`;
  
  if (code.includes(target)) {
    code = code.replace(target, newFunction);
    fs.writeFileSync(filename, code);
    console.log("Patched CommitteesRecommendations.tsx (updateEventWorkflow)");
  } else {
    console.log("updateEventWorkflow block not found in CommitteesRecommendations.tsx");
  }
}
