const fs = require('fs');
['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'].forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.replace(
    /const toggleSelectAllEvents = \(\) => \{\n    if \(selectedEventIds\.length === filteredEvents\.length \&\& filteredEvents\.length > 0\) \{\n      setSelectedEventIds\(\[\]\);\n    \} else \{\n      setSelectedEventIds\(filteredEvents\.map\(e => e\.id\)\);\n    \}\n  \};/g,
    `const toggleSelectAllEvents = () => {
    if (viewMode === "table") {
      if (selectedEventIds.length === tableRecommendations.length && tableRecommendations.length > 0) {
        setSelectedEventIds([]);
      } else {
        setSelectedEventIds(tableRecommendations.map((e: any) => e.id));
      }
    } else {
      if (selectedEventIds.length === filteredEvents.length && filteredEvents.length > 0) {
        setSelectedEventIds([]);
      } else {
        setSelectedEventIds(filteredEvents.map(e => e.id));
      }
    }
  };`
  );
  fs.writeFileSync(filepath, content, 'utf8');
});
