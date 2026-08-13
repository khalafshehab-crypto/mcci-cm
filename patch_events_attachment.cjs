const fs = require('fs');

const file = 'src/pages/Events.tsx';
let content = fs.readFileSync(file, 'utf8');

const searchUpload = `																<AttachmentInput 
																	id="agendaMinutesFile_evt" 
																	label="إرفاق محضر الاجتماع" 
																	value={agendaMinutesFile} 
																	onChange={setAgendaMinutesFile} 
																/>`;
const replaceUpload = `																<AttachmentInput 
																	id={\`agendaMinutesFile_evt-\${evt.id}\`} 
																	label="إرفاق محضر الاجتماع" 
																	value={agendaMinutesFiles[evt.id] !== undefined ? agendaMinutesFiles[evt.id] : (evt.approvedMinutesUrl || null)} 
																	onChange={(val) => setAgendaMinutesFiles(prev => ({ ...prev, [evt.id]: val }))} 
																/>`;
content = content.replace(searchUpload, replaceUpload);
fs.writeFileSync(file, content);
console.log("Patched Events.tsx");
