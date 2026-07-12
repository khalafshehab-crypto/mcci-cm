const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

// Fix in CommitteeDetailsModalContent
code = code.replace(
  `  agendaRecsModal.forEach((ar: any) => {
    if (!mappedDbMapModal.has(ar.id)) {
       allRecsModal.push(ar);
    } else {
       const existing = mappedDbMapModal.get(ar.id);
       existing.eventId = existing.eventId || ar.eventId;
       existing.committeeId = existing.committeeId || ar.committeeId;
       existing.committeeName = existing.committeeName || ar.committeeName;
       existing.eventName = existing.eventName || ar.eventName;
    }
  });

  const commRecs = allRecsModal.filter((r: any) => {`,
  `  agendaRecsModal.forEach((ar: any) => {
    if (!mappedDbMapModal.has(ar.id)) {
       allRecsModal.push(ar);
    } else {
       const existing = mappedDbMapModal.get(ar.id);
       existing.eventId = existing.eventId || ar.eventId;
       existing.committeeId = existing.committeeId || ar.committeeId;
       existing.committeeName = existing.committeeName || ar.committeeName;
       existing.eventName = existing.eventName || ar.eventName;
    }
  });

  // Also include standalone recommendations from dbEvents
  const standaloneRecsModal = (dbEvents || []).filter((e: any) => !!e.recommendationType).map((e: any) => ({
    ...e,
    id: e.id,
    eventId: e.id,
    committeeId: e.committeeId,
    title: e.title || "توصية غير مسماة",
    committeeName: e.committeeName || "لجنة غير محددة",
    eventName: "توصية مستقلة",
    status: e.status || "جديدة",
  }));
  
  allRecsModal = [...allRecsModal, ...standaloneRecsModal];

  const commRecs = allRecsModal.filter((r: any) => {`
);

// Fix in the main component's table logic
code = code.replace(
  `      agendaRecs.forEach(ar => {
        if (!mappedDbMap.has(ar.id)) {
           allRecs.push(ar);
        } else {
           const existing = mappedDbMap.get(ar.id);
           existing.eventId = existing.eventId || ar.eventId;
           existing.committeeId = existing.committeeId || ar.committeeId;
           existing.committeeName = existing.committeeName || ar.committeeName;
           existing.eventName = existing.eventName || ar.eventName;
        }
      });

      const myRecs = allRecs.filter(r => {`,
  `      agendaRecs.forEach(ar => {
        if (!mappedDbMap.has(ar.id)) {
           allRecs.push(ar);
        } else {
           const existing = mappedDbMap.get(ar.id);
           existing.eventId = existing.eventId || ar.eventId;
           existing.committeeId = existing.committeeId || ar.committeeId;
           existing.committeeName = existing.committeeName || ar.committeeName;
           existing.eventName = existing.eventName || ar.eventName;
        }
      });

      // Also include standalone recommendations from dbEvents
      const standaloneRecs = (dbEvents || []).filter(e => !!e.recommendationType).map(e => ({
        ...e,
        id: e.id,
        eventId: e.id,
        committeeId: e.committeeId,
        title: e.title || "توصية غير مسماة",
        committeeName: e.committeeName || "لجنة غير محددة",
        eventName: "توصية مستقلة",
        status: e.status || "جديدة",
      }));
      allRecs = [...allRecs, ...standaloneRecs];

      const myRecs = allRecs.filter(r => {`
);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
console.log("Done patching recs");
