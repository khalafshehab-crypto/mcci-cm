const fs = require('fs');

const path = 'src/pages/mergeDuplicates.ts';
let code = fs.readFileSync(path, 'utf8');

const target = `      let key = m.phone?.trim();
      if (!key) key = m.email?.trim();`;
const replace = `      let key = m.email?.trim()?.toLowerCase();
      if (!key) key = m.phone?.trim();
      if (!key) key = m.nationalId?.trim();`;

code = code.replace(target, replace);
fs.writeFileSync(path, code);
console.log("Patched mergeDuplicates.ts");
