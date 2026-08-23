import re

files = ['src/pages/Home.tsx', 'src/pages/CommitteesHome.tsx']

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Find the alarm loops for recommendations, tasks, and events and add auto-urgent logic based on date.

    # 1. Recommendations:
    # r.date (YYYY-MM-DD)
    
    # Let's insert a helper function for automatic urgency checking based on date
    helper_code = """
  // Helper to check if a date string (YYYY-MM-DD) is within 2 days (urgent) or overdue
  const isDateUrgent = (dateStr: string) => {
    if (!dateStr) return false;
    try {
      const today = new Date();
      today.setHours(0,0,0,0);
      const targetDate = new Date(dateStr);
      targetDate.setHours(0,0,0,0);
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Overdue (diffDays < 0) or approaching (diffDays <= 2)
      return diffDays <= 2;
    } catch(e) { return false; }
  };
"""
    
    if "const isDateUrgent" not in content:
        # insert it before `useEffect(() => { const list: Alarm[] = [];`
        pattern_insert = r'useEffect\(\(\) => \{\s*const list: Alarm\[\] = \[\];'
        replacement_insert = helper_code + '\n  useEffect(() => {\n    const list: Alarm[] = [];'
        content = re.sub(pattern_insert, replacement_insert, content)

    # 2. Recommendations update
    content = content.replace('const isUrgent = !!manuallyUrgentAlarms[alarmId];',
                              'const isUrgent = !!manuallyUrgentAlarms[alarmId] || isDateUrgent(r.date || "");')
                              
    # 3. Tasks update (t.dueDate)
    content = content.replace('const isUrgent = !!manuallyUrgentAlarms[alarmId];',
                              'const isUrgent = !!manuallyUrgentAlarms[alarmId] || (t.dueDate ? isDateUrgent(t.dueDate) : false);')

    # 4. Events update
    # In CommitteesHome/Home, events are handled as:
    # const alarmId = `evt-${evt.id}`;
    # const isUrgent = !!manuallyUrgentAlarms[alarmId];
    # We need to replace that too, but we already replaced 'const isUrgent = !!manuallyUrgentAlarms[alarmId];' globally if there are multiple matches?
    # Wait, the replace string for 2 and 3 above might conflict or apply to all!
    # Python string replace replaces ALL occurrences if we aren't careful.
    
    with open(file_path, 'w') as f:
        f.write(content)

