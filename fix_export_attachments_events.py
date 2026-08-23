import re

with open('src/pages/Events.tsx', 'r') as f:
    content = f.read()

pattern1 = re.compile(r'hasImpact: !!rec\.hasImpact\s*};')
replacement1 = """hasImpact: !!rec.hasImpact,
        isUrgent: !!rec.isUrgent,
        isImportant: !!rec.isImportant,
        impactType: rec.impactType || "عادية"
      };"""

if pattern1.search(content):
    content = pattern1.sub(replacement1, content)
    print("Fixed Events.tsx export fields!")

pattern2 = re.compile(r'duration: rec\.durationRec \|\| "أسبوعين",\s*attachments: \[\],')
replacement2 = """duration: rec.durationRec || "أسبوعين",
        attachments: (evt.approvedMinutesUrl && typeof evt.approvedMinutesUrl === 'string') 
          ? [{ id: "1", name: 'محضر الاجتماع المعتمد', url: evt.approvedMinutesUrl }] 
          : [],"""

if pattern2.search(content):
    content = pattern2.sub(replacement2, content, count=1)
    print("Fixed Events.tsx attachments!")

pattern3 = re.compile(r'isUrgent: true,\n\s*committee: evt\.committeeName,')
replacement3 = "isUrgent: !!rec.isUrgent,\n      committee: evt.committeeName,"

if pattern3.search(content):
    content = pattern3.sub(replacement3, content)
    print("Fixed Events.tsx alarms export!")

with open('src/pages/Events.tsx', 'w') as f:
    f.write(content)

