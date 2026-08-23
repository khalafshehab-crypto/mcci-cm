import re

files = ['src/pages/Home.tsx', 'src/pages/CommitteesHome.tsx']

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Section 2 (Tasks) loop looks like:
    # activeTasks.forEach((t: any) => {
    #   const alarmId = t.id || `task-${Math.random()}`;
    #   const isUrgent = !!manuallyUrgentAlarms[alarmId] || isDateUrgent(r.date || "");
    
    pattern_task = r'activeTasks\.forEach\(\(t: any\) => \{\s*const alarmId = t\.id \|\| `task-\$\{Math\.random\(\)\}`;[\s\S]*?const isUrgent = !!manuallyUrgentAlarms\[alarmId\] \|\| isDateUrgent\(r\.date \|\| ""\);'
    replacement_task = r'activeTasks.forEach((t: any) => {\n          const alarmId = t.id || `task-${Math.random()}`;\n          // Default is normal (false) unless manually marked urgent\n          const isUrgent = !!manuallyUrgentAlarms[alarmId] || isDateUrgent(t.dueDate || t.date || "");'

    if re.search(pattern_task, content):
        content = re.sub(pattern_task, replacement_task, content)
        print("Fixed tasks in " + file_path)

    # Section 3 (Events) loop looks like:
    # activeEvts.forEach((evt: any) => {
    #   const alarmId = `evt-${evt.id}`;
    #   const isUrgent = !!manuallyUrgentAlarms[alarmId] || isDateUrgent(r.date || "");

    pattern_evt = r'activeEvts\.forEach\(\(evt: any\) => \{\s*const alarmId = `evt-\$\{evt\.id\}`;[\s\S]*?const isUrgent = !!manuallyUrgentAlarms\[alarmId\] \|\| isDateUrgent\(r\.date \|\| ""\);'
    replacement_evt = r'activeEvts.forEach((evt: any) => {\n          const alarmId = `evt-${evt.id}`;\n          // Default is normal (false) unless manually marked urgent\n          const isUrgent = !!manuallyUrgentAlarms[alarmId] || isDateUrgent(evt.date || "");'

    if re.search(pattern_evt, content):
        content = re.sub(pattern_evt, replacement_evt, content)
        print("Fixed events in " + file_path)

    with open(file_path, 'w') as f:
        f.write(content)

print("Urgent logic fixed.")
