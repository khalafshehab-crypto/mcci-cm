const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx', 'src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Find updateEventWorkflow
  const oldCode = `    const evt = events.find(e => String(e.id) === String(eventId));
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
        updateFirebaseEvent(String(eventId), updated);`;
        
  const newCode = `    const evt = events.find(e => String(e.id) === String(eventId));
    if (evt) {
        const updatesToSave = { ...updates };
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
            updatesToSave.status = "مؤكد";
          } else {
            updatesToSave.status = "تأكيد الحضور";
          }
        }
        updateFirebaseEvent(String(eventId), updatesToSave);`;

  if (content.includes(oldCode)) {
     content = content.replace(oldCode, newCode);
     fs.writeFileSync(file, content);
     console.log('Patched ' + file);
  } else {
     console.log('Could not find code block in ' + file);
     
     // Try a regex fallback
     const regex = /const evt = events\.find\(e => String\(e\.id\) === String\(eventId\)\);\s*if \(evt\) \{\s*const updated = \{ \.\.\.evt, \.\.\.updates \};\s*\/\/ Dynamic Quorum side-effect[\s\S]*?updateFirebaseEvent\(String\(eventId\), updated\);/;
     if (regex.test(content)) {
         content = content.replace(regex, newCode);
         fs.writeFileSync(file, content);
         console.log('Patched via regex ' + file);
     } else {
         console.log('Regex also failed ' + file);
     }
  }
}
