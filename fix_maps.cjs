const fs = require('fs');

function fixKeys(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /\{uniqueKinds\.map\(\(kind\) => \{\s+const count = commEvents\.filter\(\(e\) => getEventKindStr\(\e\.title\) === kind\)\.length;\s+return \(\s+<motion\.div/g,
    '{uniqueKinds.map((kind) => {\n                      const count = commEvents.filter((e) => getEventKindStr(e.title) === kind).length;\n                      return (\n                        <motion.div key={kind}'
  );
  code = code.replace(
    /\{activeClassifications\.map\(\(cls\) => \{\s+const count = kindEvents\.filter\(\(e\) => getEventClassification\(\e\.title\) === cls\)\.length;\s+return \(\s+<motion\.div/g,
    '{activeClassifications.map((cls) => {\n                      const count = kindEvents.filter((e) => getEventClassification(e.title) === cls).length;\n                      return (\n                        <motion.div key={cls}'
  );
  fs.writeFileSync(file, code);
}

fixKeys('src/pages/Events.tsx');
fixKeys('src/pages/CommitteesEvents.tsx');
