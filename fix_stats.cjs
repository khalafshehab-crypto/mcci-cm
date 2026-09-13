const fs = require('fs');

let code = fs.readFileSync('src/hooks/useDashboardStats.ts', 'utf8');

const targetStr = `const evts = eventsSnap.docs.map(d => d.data());
      const totalEvts = evts.length;`;

const replacementStr = `const evts = eventsSnap.docs.map(d => d.data());
      
      const isMeeting = (e: any) => e.type === "اجتماع" || getEventKindStr(e.title) === "اجتماع" || getEventKindStr(e.eventName) === "اجتماع";
      const meetingsEvts = evts.filter(e => isMeeting(e)).length;
      const totalEvts = evts.filter(e => !isMeeting(e)).length;`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  
  // also need to remove the old meetingsEvts calculation
  const oldMeetingsStr = `const meetingsEvts = evts.filter(e => e.type === "اجتماع" || getEventKindStr(e.title) === "اجتماع" || getEventKindStr(e.eventName) === "اجتماع").length;`;
  code = code.replace(oldMeetingsStr, '');
  
  fs.writeFileSync('src/hooks/useDashboardStats.ts', code);
  console.log("Fixed stats count");
} else {
  console.log("Could not find target string to replace");
}
