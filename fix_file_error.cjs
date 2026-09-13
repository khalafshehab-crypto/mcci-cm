const fs = require('fs');

const files = [
  'src/pages/CentersEvents.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/AffiliatesEvents.tsx',
  'src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // We need to replace `if (file === 'src/pages/CommitteesEvents.tsx' || file.includes('Committees')) {`
  // with a hardcoded boolean for that file.
  
  if (file.includes('CommitteesEvents.tsx')) {
    code = code.replace(/if \(file === 'src\/pages\/CommitteesEvents\.tsx' \|\| file\.includes\('Committees'\)\) \{/g, 'if (true) {');
  } else {
    code = code.replace(/if \(file === 'src\/pages\/CommitteesEvents\.tsx' \|\| file\.includes\('Committees'\)\) \{/g, 'if (false) {');
  }

  fs.writeFileSync(file, code);
  console.log("Fixed file reference in", file);
}
