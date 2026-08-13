const fs = require('fs');

const files = ['src/pages/CommitteesEvents.tsx', 'src/pages/Events.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace state definition
  content = content.replace(
    /const \[agendaMinutesFile, setAgendaMinutesFile\] = useState<File \| string \| null>\(null\);/,
    'const [agendaMinutesFiles, setAgendaMinutesFiles] = useState<Record<string, File | string | null>>({});'
  );
  
  // Replace references
  const searchUpload = `																<AttachmentInput 
																	id="agendaMinutesFile" 
																	label="إرفاق محضر الاجتماع" 
																	value={agendaMinutesFile} 
																	onChange={setAgendaMinutesFile} 
																/>`;
  const replaceUpload = `																<AttachmentInput 
																	id={\`agendaMinutesFile-\${evt.id}\`} 
																	label="إرفاق محضر الاجتماع" 
																	value={agendaMinutesFiles[evt.id] !== undefined ? agendaMinutesFiles[evt.id] : (evt.approvedMinutesUrl || null)} 
																	onChange={(val) => setAgendaMinutesFiles(prev => ({ ...prev, [evt.id]: val }))} 
																/>`;
  content = content.replace(searchUpload, replaceUpload);
  
  // Replace click handler var assignment
  const searchBtn = `if (!agendaMinutesFile) return;`;
  const replaceBtn = `const currentAgendaFile = agendaMinutesFiles[evt.id] !== undefined ? agendaMinutesFiles[evt.id] : (evt.approvedMinutesUrl || null);
																		if (!currentAgendaFile) return;`;
  content = content.replace(searchBtn, replaceBtn);
  
  // Replace references of agendaMinutesFile to currentAgendaFile inside the onClick handler
  // Note: We only want to do this inside the onClick handler block.
  // Actually, we can just replace 'agendaMinutesFile' with 'currentAgendaFile' inside the try block.
  
  const extractLogicRegex = /try \{([\s\S]*?)const response = await fetch\('/;
  if (extractLogicRegex.test(content)) {
     const match = content.match(extractLogicRegex)[1];
     const newMatch = match.replace(/agendaMinutesFile/g, 'currentAgendaFile');
     content = content.replace(match, newMatch);
  }
  
  // Also disable button
  content = content.replace(
    /disabled=\{\!agendaMinutesFile \|\| isReadingMinutes\}/,
    'disabled={!(agendaMinutesFiles[evt.id] !== undefined ? agendaMinutesFiles[evt.id] : evt.approvedMinutesUrl) || isReadingMinutes}'
  );
  
  fs.writeFileSync(file, content);
  console.log("Patched " + file);
}
