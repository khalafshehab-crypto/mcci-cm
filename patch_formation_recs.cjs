const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// We need to insert agenda recs gathering logic right after:
// let allRecs = dbRecs ? [...dbRecs] : [];
// inside the useEffect (line ~571) and inside filteredCommittees (line ~818).

function addAgendaRecs(codeStr, marker) {
  return codeStr.split(marker).join(marker + `
      // Add agenda recommendations
      const agendaRecs = [];
      (dbEvents || []).forEach((evt) => {
        if (evt && evt.agenda && Array.isArray(evt.agenda)) {
          evt.agenda.forEach((item, index) => {
            if (item.recommendation && item.recommendation.trim() !== "" && !item.inactiveRecommendation) {
              const recId = \`custom-rec-\${evt.id}-\${item.id || index}\`;
              agendaRecs.push({
                id: recId,
                title: item.recommendation,
                committeeName: evt.committeeName || "لجنة غير محددة",
                eventName: evt.title,
                status: "جديدة"
              });
            }
          });
        }
      });
      
      // Merge allRecs and agendaRecs to prevent duplicates
      const mappedDbMap = new Map();
      allRecs.forEach(r => mappedDbMap.set(String(r.id), r));
      
      agendaRecs.forEach(ar => {
        if (!mappedDbMap.has(ar.id)) {
           allRecs.push(ar);
        }
      });
`);
}

code = addAgendaRecs(code, 'let allRecs = dbRecs ? [...dbRecs] : [];');

// Then we need to fix `commRecs` in `CommitteeDetailsModalContent` (line ~58)
const modalMarker = `const commRecs = (dbRecs || []).filter((r: any) => {`;
code = code.replace(modalMarker, `
  let allRecsModal = dbRecs ? [...dbRecs] : [];
  const agendaRecsModal = [];
  (dbEvents || []).forEach((evt: any) => {
    if (evt && evt.agenda && Array.isArray(evt.agenda)) {
      evt.agenda.forEach((item: any, index: number) => {
        if (item.recommendation && item.recommendation.trim() !== "" && !item.inactiveRecommendation) {
          const recId = \`custom-rec-\${evt.id}-\${item.id || index}\`;
          agendaRecsModal.push({
            id: recId,
            title: item.recommendation,
            committeeName: evt.committeeName || "لجنة غير محددة",
            eventName: evt.title,
            status: "جديدة"
          });
        }
      });
    }
  });
  
  const mappedDbMapModal = new Map();
  allRecsModal.forEach((r: any) => mappedDbMapModal.set(String(r.id), r));
  
  agendaRecsModal.forEach((ar: any) => {
    if (!mappedDbMapModal.has(ar.id)) {
       allRecsModal.push(ar);
    }
  });

  const commRecs = allRecsModal.filter((r: any) => {
`);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
console.log("Patched successfully");
