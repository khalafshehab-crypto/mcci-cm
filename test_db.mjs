import { readFileSync } from 'fs';
let code = readFileSync('src/lib/firebaseUtils.ts', 'utf8');
console.log(code.includes('saveLocalCollection'));
