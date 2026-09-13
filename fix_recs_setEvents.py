import re

with open('src/pages/CommitteesRecommendations.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix updateEventWorkflow
old_update = r'''    setEvents(prev => prev.map(evt => {
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
            updated.status = "محجوز";
          }
        }
        return updated;
      }
      return evt;
    }));'''

new_update = r'''    const evt = events.find(e => String(e.id) === String(eventId));
    if (evt) {
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
            updated.status = "محجوز";
          }
        }
        
        updateFirebaseEvent(String(eventId), updated);
    }'''
content = content.replace(old_update, new_update)


old_1352 = r'''        // Save to local context for standalone recommendations
        setEvents(events.map(ev => ev.id === editingEvent.id ? updatedRec : ev));'''
new_1352 = r'''        // Save to local context for standalone recommendations
        updateFirebaseEvent(String(editingEvent.id), updatedRec);'''
content = content.replace(old_1352, new_1352)

old_1385 = r'''      setEvents([newRec, ...events]);'''
new_1385 = r'''      addFirebaseEvent(newRec);'''
content = content.replace(old_1385, new_1385)

with open('src/pages/CommitteesRecommendations.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updates")
