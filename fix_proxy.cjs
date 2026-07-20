const fs = require('fs');
let code = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

code = code.replace(
`      headers: options.headers || {},`,
`      headers: { "Content-Type": "application/json", ...options.headers },`
);
code = code.replace(
`      headers: options.headers || {},`,
`      headers: { "Content-Type": "application/json", ...options.headers },`
);
fs.writeFileSync('src/lib/googleApi.ts', code);
