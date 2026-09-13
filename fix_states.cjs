const fs = require('fs');

const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Let's find singleEmployee definition and inject states after it
  const match = code.match(/const \[singleEmployee, setSingleEmployee\] = useState\([^)]+\);/);
  
  if (match && !code.includes('const [singleAdditionalInvitees')) {
    const states = `
  const [singleAdditionalInvitees, setSingleAdditionalInvitees] = useState<string[]>([]);
  const [seriesAdditionalInvitees, setSeriesAdditionalInvitees] = useState<string[]>([]);
  const [isSingleInviteesOpen, setIsSingleInviteesOpen] = useState(false);
  const [isSeriesInviteesOpen, setIsSeriesInviteesOpen] = useState(false);
  
  const allGroupedEmployees = React.useMemo(() => {
    const list = dbEmployees.filter((e: any) => 
      e && e.role !== "SYS_ADMIN" && e.id !== "01" && e.name !== "شهاب الدين" && e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && e.active
    );
    const grouped = list.reduce((acc: any, emp: any) => {
      const groupName = emp.orgLevel3 || emp.orgLevel2 || "أخرى";
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push({ name: emp.name, email: emp.email });
      return acc;
    }, {});
    return grouped;
  }, [dbEmployees]);`;
    
    code = code.replace(match[0], match[0] + states);
    fs.writeFileSync(file, code);
    console.log("Fixed states in", file);
  } else {
    console.log("States already present or match not found in", file);
  }
}
