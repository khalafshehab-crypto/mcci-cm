import re

with open('src/pages/Recommendations.tsx', 'r') as f:
    content = f.read()

new_sorted = """  const sortedTableEvents = React.useMemo(() => {
    const term = filterQuery.trim().toLowerCase();
    const list = allDbRecommendations.filter((r: any) => {
      if (!r || (r.department && r.department !== "إدارة اللجان")) return false;
      if (!term) return true;
      return (
        (r.title && r.title.toLowerCase().includes(term)) ||
        (r.committeeName && r.committeeName.toLowerCase().includes(term))
      );
    });
    
    return list.sort((a, b) => {
      // sort by date descending
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });
  }, [allDbRecommendations, filterQuery]);"""

content = re.sub(r'const sortedTableEvents = React\.useMemo\(\(\) => \{.*?\}, \[filteredEvents\]\);', new_sorted, content, flags=re.DOTALL)

with open('src/pages/Recommendations.tsx', 'w') as f:
    f.write(content)
print("Updated sortedTableEvents")
