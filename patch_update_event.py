import re

files_to_patch = ['src/pages/Events.tsx', 'src/pages/CommitteesEvents.tsx']

for filepath in files_to_patch:
    with open(filepath, 'r') as f:
        content = f.read()

    # Update updateEventWorkflow to use updateFirebaseEvent directly
    old_code = """
    setEvents(prev => prev.map(evt => {
      if (String(evt.id) === String(eventId)) {
        const updated = { ...evt, ...updates };
        
        // Dynamic Quorum side-effect: automatically check if quorum is met and update status
        if ('confirmedAttendees' in updates) {
          const commMems = allMembers.filter(m => (String(m.committeeId) === String(updated.committeeId) || String(m.secondaryCommitteeId) === String(updated.committeeId)) && m.active !== false);
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
"""
    new_code = """
    const evt = events.find(e => String(e.id) === String(eventId));
    if (evt) {
        const updated = { ...evt, ...updates };
        
        // Dynamic Quorum side-effect
        if ('confirmedAttendees' in updates) {
          const commMems = allMembers.filter(m => (String(m.committeeId) === String(updated.committeeId) || String(m.secondaryCommitteeId) === String(updated.committeeId)) && m.active !== false);
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
        updateFirebaseEvent(String(eventId), updated);
    }
"""
    content = content.replace(old_code.strip(), new_code.strip())
    
    with open(filepath, 'w') as f:
        f.write(content)
