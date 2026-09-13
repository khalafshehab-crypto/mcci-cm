const fs = require('fs');

const files = [
  '/app/applet/src/pages/CommitteesEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Add externalInvitees to EventItem interface
  if (!content.includes('externalInvitees?: string[]')) {
    content = content.replace(
      'employees: string[];',
      'employees: string[];\n  externalInvitees?: string[];'
    );
  }

  // Add state variables
  if (!content.includes('singleExternalInvitees')) {
    const hookInsert = `
  const [singleExternalInvitees, setSingleExternalInvitees] = useState<string[]>([]);
  const [seriesExternalInvitees, setSeriesExternalInvitees] = useState<string[]>([]);
  const [isSingleMembersOpen, setIsSingleMembersOpen] = useState(false);
  const [isSeriesMembersOpen, setIsSeriesMembersOpen] = useState(false);
  const [externalInput, setExternalInput] = useState("");
  const [seriesExternalInput, setSeriesExternalInput] = useState("");
`;
    // Insert after isSeriesInviteesOpen
    content = content.replace(
      /const \[isSeriesInviteesOpen, setIsSeriesInviteesOpen\] = useState\(false\);/,
      `const [isSeriesInviteesOpen, setIsSeriesInviteesOpen] = useState(false);${hookInsert}`
    );
  }

  // Handle edit form populate
  if (content.includes('setSingleTime(evt.time || "");')) {
    content = content.replace(
      /setSingleTime\(evt\.time \|\| ""\);/,
      `setSingleTime(evt.time || "");
      setSingleExternalInvitees(evt.externalInvitees || []);`
    );
  } else if (content.includes('setSingleEmployee(evt.employees?.[0] || "");')) {
     content = content.replace(
      /setSingleEmployee\(evt\.employees\?\.\[0\] \|\| ""\);/,
      `setSingleEmployee(evt.employees?.[0] || "");
      setSingleExternalInvitees(evt.externalInvitees || []);`
    );
  }

  // Reset form
  if (content.includes('setSingleEmployee(dynamicEmployees[0] || "");')) {
     content = content.replace(
      /setSingleEmployee\(dynamicEmployees\[0\] \|\| ""\);/,
      `setSingleEmployee(dynamicEmployees[0] || "");
    setSingleExternalInvitees([]);`
    );
  }

  fs.writeFileSync(file, content);
  console.log(`Patched ${file} state`);
}
