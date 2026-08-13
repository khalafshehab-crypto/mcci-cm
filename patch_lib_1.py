import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

# 1. State changes
content = content.replace('const [aiGenCommittee, setAiGenCommittee] = useState("");', 
'''const [aiGenCommittees, setAiGenCommittees] = useState<string[]>([]);
  const [circularViaEmail, setCircularViaEmail] = useState(false);
  const [circularViaWhatsApp, setCircularViaWhatsApp] = useState(false);
  const [circularMainFile, setCircularMainFile] = useState<File | null>(null);
  const [circularAtt1, setCircularAtt1] = useState<File | null>(null);
  const [circularAtt2, setCircularAtt2] = useState<File | null>(null);
  const [circularAtt3, setCircularAtt3] = useState<File | null>(null);
  const [circularIncomingFrom, setCircularIncomingFrom] = useState("");
  const [circularNumberDate, setCircularNumberDate] = useState("");
  const [circularSubject, setCircularSubject] = useState("");
''')

# 2. Add "circular" option to workspaceService
content = content.replace('<option value="forms">نماذج (Google Forms)</option>', 
'<option value="forms">نماذج (Google Forms)</option>\n                             <option value="circular">تعميم (Circular)</option>')

# 3. Handle templateType string for circular
content = content.replace('else if(val === "forms") setAiGenTemplateType("نماذج Forms");',
'else if(val === "forms") setAiGenTemplateType("نماذج Forms");\n                               else if(val === "circular") { setAiGenTemplateType("تعميم"); setAiGenMode("new"); }')

# 4. Hide "حالة النموذج" if circular
content = re.sub(r'(<div>\s*<label className="block text-sm font-bold text-gray-800 mb-2">حالة النموذج</label>.*?</div>)',
    r'{workspaceService !== "circular" && \1}', content, flags=re.DOTALL)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
