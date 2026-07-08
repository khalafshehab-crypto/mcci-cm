const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Insert tableRecommendations right after sortedTableEvents
  const tableRecsCode = `
  const tableRecommendations = React.useMemo(() => {
    const term = filterQuery.trim().toLowerCase();
    
    let mapped = [...allDbRecommendations].map((rec: any) => {
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

    if (term) {
       mapped = mapped.filter(r => 
         (r.title && r.title.toLowerCase().includes(term)) ||
         (r.committeeName && r.committeeName.toLowerCase().includes(term))
       );
    }
    return mapped;
  }, [allDbRecommendations, filterQuery]);
`;

  if (!content.includes('const tableRecommendations = React.useMemo')) {
    content = content.replace(
      'const sortedTableEvents = React.useMemo(() => {',
      tableRecsCode + '\n  const sortedTableEvents = React.useMemo(() => {'
    );
  }

  // Replace sortedTableEvents.map with tableRecommendations.map in the table
  content = content.replace(
    /\{sortedTableEvents\.map\(\(evt, idx\) => \{/g,
    '{tableRecommendations.map((evt: any, idx) => {'
  );
  
  // Replace the toggle select all checkbox logic for the table view
  content = content.replace(
    /checked=\{selectedEventIds\.length === filteredEvents\.length \&\& filteredEvents\.length > 0\}/g,
    'checked={selectedEventIds.length === tableRecommendations.length && tableRecommendations.length > 0}'
  );

  fs.writeFileSync(filepath, content, 'utf8');
}

patchFile('src/pages/CommitteesRecommendations.tsx');
patchFile('src/pages/Recommendations.tsx');
console.log('Patched');
