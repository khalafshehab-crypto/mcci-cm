const fs = require('fs');

function fixKeys(file) {
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /\{showWorkspaceCenter && \(\s*<motion\.div\s*initial=/g,
    '{showWorkspaceCenter && (\n          <motion.div key="workspace-center"\n            initial='
  );

  fs.writeFileSync(file, code);
}

fixKeys('src/pages/CommitteesLibrary.tsx');
fixKeys('src/pages/Library.tsx');
