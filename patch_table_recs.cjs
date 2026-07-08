const fs = require('fs');

const filepath = 'src/pages/CommitteesRecommendations.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const replacement = `  const tableRecommendations = React.useMemo(() => {
    const term = filterQuery.trim().toLowerCase();
    
    // Get recommendations from DB
    let mappedDb = [...allDbRecommendations].map((rec: any) => {
       return {
          ...rec,
          id: rec.id,
          title: rec.description || rec.title || "توصية غير مسماة",
          committeeName: rec.committeeName || "غير محدد",
          date: rec.date || "2026-06-11",
          status: rec.status || "جديدة",
          recommendationAssignee: rec.assignedTo || "غير محدد",
          recommendationType: true,
          isRealEvent: false
       };
    });

    // Get standalone recommendations from events (they have recommendationType)
    let mappedStandalone = events
       .filter(e => !!e.recommendationType)
       .map(e => ({
          ...e,
          id: e.id,
          title: e.title || "توصية غير مسماة",
          committeeName: e.committeeName || "غير محدد",
          date: e.date || "2026-06-11",
          status: e.status || "جديدة",
          recommendationAssignee: e.employees && e.employees.length > 0 ? e.employees[0] : "غير محدد",
          recommendationType: e.recommendationType || true,
          isRealEvent: false
       }));

    let combined = [...mappedDb, ...mappedStandalone];

    if (term) {
       combined = combined.filter(r => 
         (r.title && r.title.toLowerCase().includes(term)) ||
         (r.committeeName && r.committeeName.toLowerCase().includes(term))
       );
    }
    
    // Sort by date (descending)
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allDbRecommendations, events, filterQuery]);`;

content = content.replace(/const tableRecommendations = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[allDbRecommendations, filterQuery\]\);/, replacement);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Patched table recommendations');
