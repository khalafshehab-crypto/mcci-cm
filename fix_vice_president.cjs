const fs = require('fs');

let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const target1 = `  const commMembers = (dbMembers || []).filter((m: any) => String(m.committeeId) === String(detailsComm.id) || advancedMatch(m.committeeName, detailsComm.name));`;
const replacement1 = `  const commMembers = (dbMembers || []).filter((m: any) => String(m.committeeId) === String(detailsComm.id) || advancedMatch(m.committeeName, detailsComm.name));
  
  const actualPresident = commMembers.find((m: any) => m.role === "رئيس" || m.role === "رئيس اللجنة");
  const presidentName = actualPresident ? \`\${actualPresident.title || ''} \${actualPresident.name}\`.trim() : (detailsComm.president || "-");

  const actualVice = commMembers.find((m: any) => m.role === "نائب" || m.role === "نائب رئيس" || m.role === "نائب رئيس اللجنة");
  const vicePresidentName = actualVice ? \`\${actualVice.title || ''} \${actualVice.name}\`.trim() : (detailsComm.vicePresident || "-");`;

content = content.replace(target1, replacement1);

const target2 = `<span className="text-xs font-extrabold text-blue-900">{detailsComm.president || "-"}</span>`;
const replacement2 = `<span className="text-xs font-extrabold text-blue-900">{presidentName}</span>`;
content = content.replace(target2, replacement2);

const target3 = `<span className="text-xs font-extrabold text-purple-900">{detailsComm.vicePresident || "-"}</span>`;
const replacement3 = `<span className="text-xs font-extrabold text-purple-900">{vicePresidentName}</span>`;
content = content.replace(target3, replacement3);

if (content.includes("presidentName")) {
    fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
    console.log("Success");
} else {
    console.log("Failed to inject");
}
