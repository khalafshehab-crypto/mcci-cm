import re

for filename in ['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx']:
    with open(filename, 'r') as f:
        content = f.read()

    new_filtered_events = """  const filteredEvents = events.filter((e) => {
    // Only show events that have exported recommendations (independent Recommendations page)
    if (!e.exportedRecommendationsToPage) return false;
    // Hide recommendation pseudo-events from the meetings list
    if (e.recommendationClassification) return false;
    
    const term = filterQuery.trim().toLowerCase();
    if (!term) return true;
    return (
      e.title.toLowerCase().includes(term) ||
      e.committeeName.toLowerCase().includes(term)
    );
  });"""

    content = re.sub(r'  const filteredEvents = events\.filter\(\(e\) => \{.*?\}\);\n', new_filtered_events + '\n', content, flags=re.DOTALL)
    
    with open(filename, 'w') as f:
        f.write(content)
    print(f"Fixed filteredEvents in {filename}")

