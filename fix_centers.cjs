const fs = require('fs');
let c = fs.readFileSync('src/pages/CentersEvents.tsx', 'utf8');

c = c.replace(
  /const { data: rawCommittees } = useFirestoreCollection<any>\("centers_list", \[\]\);/,
  `const { data: orgNodes } = useFirestoreCollection<any>("org_structure", []);\n  const rawCommittees = React.useMemo(() => orgNodes.filter(n => n.parent === "المراكز" || n.parent === "إدارة المراكز"), [orgNodes]);`
);

fs.writeFileSync('src/pages/CentersEvents.tsx', c);
