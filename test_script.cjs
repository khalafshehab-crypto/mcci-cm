const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');
const searchStr = `        await logSystemAction(existingAdmin.name, \`تسجيل دخول ناجح للمسؤول برمز بريدي معتمد [\${emailLower}]\`, "ناجحة");`;
console.log(code.includes(searchStr));
