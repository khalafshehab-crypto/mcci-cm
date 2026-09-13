const fs = require('fs');

let code = fs.readFileSync('src/pages/CentersEvents.tsx', 'utf8');

// Add States
const stateInsertPos = code.indexOf('const [singleClassification, setSingleClassification] = useState("");');
const stateInsert = `
  const [singlePartyName, setSinglePartyName] = useState("");
  const [singleInviteesEnabled, setSingleInviteesEnabled] = useState(false);
  const [singleInvitedEmployees, setSingleInvitedEmployees] = useState<string[]>([]);
  
  const [seriesPartyName, setSeriesPartyName] = useState("");
  const [seriesInviteesEnabled, setSeriesInviteesEnabled] = useState(false);
  const [seriesInvitedEmployees, setSeriesInvitedEmployees] = useState<string[]>([]);
`;
code = code.slice(0, stateInsertPos) + stateInsert + code.slice(stateInsertPos);

// Add reset logic
const resetInsertPos = code.indexOf('setSingleEmployee(dynamicEmployees[0] || "");');
const resetInsert = `
    setSinglePartyName("");
    setSingleInviteesEnabled(false);
    setSingleInvitedEmployees([]);
`;
// Need to find the exact place to reset. Let's find "setSingleEmployee(dynamicEmployees[0] || "");\n"
code = code.replace(/setSingleEmployee\(dynamicEmployees\[0\] \|\| ""\);\s+\/\/ reset series/, `setSingleEmployee(dynamicEmployees[0] || "");
    setSinglePartyName("");
    setSingleInviteesEnabled(false);
    setSingleInvitedEmployees([]);
    // reset series`);
    
code = code.replace(/setSeriesAssignedEmployee\(dynamicEmployees\[0\] \|\| ""\);\s+setSeriesDayOfWeek\("الأحد"\);/, `setSeriesAssignedEmployee(dynamicEmployees[0] || "");
    setSeriesPartyName("");
    setSeriesInviteesEnabled(false);
    setSeriesInvitedEmployees([]);
    setSeriesDayOfWeek("الأحد");`);

// Add formatCenterNameArabic inside the component or before
const utilsImport = code.indexOf('export default function CentersEvents() {');
const centerFormatFunc = `
const formatCenterNameArabic = (commName: string) => {
  if (!commName) return "";
  const trimmed = commName.trim();
  if (trimmed.startsWith("مركز ")) return trimmed;
  if (trimmed === "مركز") return trimmed;
  return \`مركز \${trimmed}\`;
};
`;
code = code.slice(0, utilsImport) + centerFormatFunc + code.slice(utilsImport);


// Fix autoTitle for single
code = code.replace(
  /const formattedCommName = commName \? formatCommitteeNameArabic\(commName\) : "";\s*const numWord = getArabicOrdinalGlobal\(singleEventNumber\);\s*let autoTitle = \(singleKind === "اجتماع" \? \`\$\{singleKind\} \$\{formattedCommName\} \$\{classifStr\} \$\{numWord\}\` : \`\$\{singleKind\} \$\{formattedCommName\} \$\{numWord\}\`\)\.trim\(\);/,
  `const formattedCommName = commName ? formatCenterNameArabic(commName) : "";
      const numWord = getArabicOrdinalGlobal(singleEventNumber);
      let autoTitle = (singleKind === "اجتماع" ? \`\${singleKind} \${formattedCommName} \${classifStr} \${numWord}\` : \`\${singleKind} \${formattedCommName} \${numWord}\`).trim();
      if (singlePartyName.trim()) {
        autoTitle += \` مع \${singlePartyName.trim()}\`;
      }`
);

// Fix autoTitle for series
code = code.replace(
  /const formattedCommName = commName \? formatCommitteeNameArabic\(commName\) : "";\s*const prefixToMatch = \(seriesKind === "اجتماع" \? \`\$\{seriesKind\} \$\{formattedCommName\} \$\{classifStr\}\` : \`\$\{seriesKind\} \$\{formattedCommName\}\`\)\.trim\(\);/,
  `const formattedCommName = commName ? formatCenterNameArabic(commName) : "";
    const prefixToMatch = (seriesKind === "اجتماع" ? \`\${seriesKind} \${formattedCommName} \${classifStr}\` : \`\${seriesKind} \${formattedCommName}\`).trim();`
);

code = code.replace(
  /let autoTitle = \(seriesKind === "اجتماع" \? \`\$\{seriesKind\} \$\{formattedCommName\} \$\{classifStr\} \$\{getArabicOrdinalGlobal\(existingCount \+ tempId\)\}\` : \`\$\{seriesKind\} \$\{formattedCommName\} \$\{getArabicOrdinalGlobal\(existingCount \+ tempId\)\}\`\)\.trim\(\);/,
  `let autoTitle = (seriesKind === "اجتماع" ? \`\${seriesKind} \${formattedCommName} \${classifStr} \${getArabicOrdinalGlobal(existingCount + tempId)}\` : \`\${seriesKind} \${formattedCommName} \${getArabicOrdinalGlobal(existingCount + tempId)}\`).trim();
      if (seriesPartyName.trim()) {
        autoTitle += \` مع \${seriesPartyName.trim()}\`;
      }`
);

// Update handleSubmit to include invitedEmployees for single
code = code.replace(
  /employees: \[singleEmployee\]\.filter\(Boolean\),/g,
  `employees: [singleEmployee, ...(singleInviteesEnabled ? singleInvitedEmployees : [])].filter(Boolean),`
);

// We also need to fix adding new event `id: Date.now(), title: newTitle, ...`
code = code.replace(
  /employees: \[singleEmployee\]\.filter\(Boolean\),\s*members: newMembers,/g,
  `employees: [singleEmployee, ...(singleInviteesEnabled ? singleInvitedEmployees : [])].filter(Boolean),
          members: newMembers,`
);

fs.writeFileSync('src/pages/CentersEvents.tsx', code);
