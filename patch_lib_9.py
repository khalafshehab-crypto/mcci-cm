import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

content = content.replace('setAiGenCommittee("");', 'setAiGenCommittees([]);\n    setCircularViaEmail(false);\n    setCircularViaWhatsApp(false);\n    setCircularMainFile(null);\n    setCircularAtt1(null);\n    setCircularAtt2(null);\n    setCircularAtt3(null);\n    setCircularIncomingFrom("");\n    setCircularNumberDate("");\n    setCircularSubject("");')

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
