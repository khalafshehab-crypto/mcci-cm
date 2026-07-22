const fs = require('fs');

let mainTsx = fs.readFileSync('src/main.tsx', 'utf8');

const patch = `
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Encountered two children with the same key')) {
      fetch('/api/log-client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arg0: args[0], arg1: args[1], arg2: args[2] })
      }).catch(e => {});
    }
    originalConsoleError(...args);
  };
  `;

// Replace the old patch
mainTsx = mainTsx.replace(/const originalConsoleError.*catch\(e => \{\}\);\n    \}\n    originalConsoleError\(\.\.\.args\);\n  \};\n/s, patch);
fs.writeFileSync('src/main.tsx', mainTsx);
