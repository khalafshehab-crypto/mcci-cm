const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

const patch = `
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Encountered two children with the same key')) {
    fetch('/api/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        log: 'Duplicate key error: ' + args.join(' '),
        stack: new Error().stack
      })
    }).catch(()=> {
      // fallback to writing directly if possible, though browser can't write to fs
    });
  }
  originalError(...args);
};
`;

if (!code.includes('originalError')) {
  // insert after imports
  code = code.replace(/import.*?['"];\n/g, match => match + '\n' + patch + '\n');
  fs.writeFileSync('src/main.tsx', code);
  console.log("Patched main.tsx");
}
