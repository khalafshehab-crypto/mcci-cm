const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const advancedMatchDef = `
const advancedMatch = (commName: string, targetName: string) => {
  if (!commName || !targetName) return false;
  const clean = (s: string) => s.replace(/لجنة/g, "").replace(/الـ/g, "").replace(/ال/g, "").replace(/\\s+/g, " ").trim();
  const c1 = clean(commName);
  const c2 = clean(targetName);
  if (c1.includes(c2) || c2.includes(c1)) return true;
  
  const w1 = c1.split(" ").filter(w => w.length >= 3);
  const w2 = c2.split(" ").filter(w => w.length >= 3);
  return w1.some(word => w2.some(other => other.includes(word) || word.includes(other)));
};
`;

if (!code.includes('const advancedMatch = (commName: string, targetName: string) => {')) {
  // Wait, it is already defined inside the functions. Let's just define it at the top and remove the inner ones, or just add it inside the modal.
}

code = code.replace(/const commRecs = allRecsModal\.filter\(\(r: any\) => \{[\s\S]*?return r\.committeeName === detailsComm\.name \|\| event;\n  \}\);/m, 
`  const advancedMatch = (commName: string, targetName: string) => {
    if (!commName || !targetName) return false;
    const clean = (s: string) => s.replace(/لجنة/g, "").replace(/الـ/g, "").replace(/ال/g, "").replace(/\\s+/g, " ").trim();
    const c1 = clean(commName);
    const c2 = clean(targetName);
    if (c1.includes(c2) || c2.includes(c1)) return true;
    const w1 = c1.split(" ").filter(w => w.length >= 3);
    const w2 = c2.split(" ").filter(w => w.length >= 3);
    return w1.some(word => w2.some(other => other.includes(word) || word.includes(other)));
  };

  const commRecs = allRecsModal.filter((r: any) => {
     const event = commEvents.find((e: any) => String(e.id) === String(r.eventId) || e.title === r.eventName);
     return advancedMatch(r.committeeName || r.dept, detailsComm.name) || event;
  });`
);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
