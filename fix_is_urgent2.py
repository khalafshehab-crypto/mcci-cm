import re

files = ['src/pages/Home.tsx', 'src/pages/CommitteesHome.tsx']

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Recommendations:
    pattern_rec = r'activeRecs\.forEach\(\(r: any\) => \{\s*const alarmId = r\.id \|\| `rec-\$\{Math\.random\(\)\}`;[\s\S]*?const isUrgent = !!manuallyUrgentAlarms\[alarmId\] \|\| isDateUrgent\(evt\.date \|\| ""\);'
    replacement_rec = r'activeRecs.forEach((r: any) => {\n          const alarmId = r.id || `rec-${Math.random()}`;\n          // Default is normal (false) unless manually marked urgent\n          const isUrgent = !!manuallyUrgentAlarms[alarmId] || isDateUrgent(r.date || "");'

    if re.search(pattern_rec, content):
        content = re.sub(pattern_rec, replacement_rec, content)
        print("Fixed recs in " + file_path)

    with open(file_path, 'w') as f:
        f.write(content)

