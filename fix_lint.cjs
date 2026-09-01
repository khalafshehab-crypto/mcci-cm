const fs = require('fs');
const path = 'src/components/GlobalNotificationListener.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace('"info"', '"success"');

fs.writeFileSync(path, code);
console.log("Fixed lint error.");
