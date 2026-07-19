const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

content = content.replace(
  /const \[formationLetter, setFormationLetter\] = useState\(""\);/,
  `const [formationLetter, setFormationLetter] = useState<File | string | null>(null);
  const [membersApproval, setMembersApproval] = useState<File | string | null>(null);
  const [regulations, setRegulations] = useState<File | string | null>(null);
  const [guides, setGuides] = useState<File | string | null>(null);`
);

content = content.replace(
  /setFormationLetter\(""\);/g,
  `setFormationLetter(null);
    setMembersApproval(null);
    setRegulations(null);
    setGuides(null);`
);

content = content.replace(
  /setFormationLetter\(comm\.formationLetter \|\| ""\);/,
  `setFormationLetter(comm.formationLetter || null);
    setMembersApproval(comm.membersApproval || null);
    setRegulations(comm.regulations || null);
    setGuides(comm.guides || null);`
);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
