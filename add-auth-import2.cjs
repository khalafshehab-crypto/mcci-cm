const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(/import \{ db, doc, onSnapshot \} from "\.\/lib\/firebase";/, 'import { db, doc, onSnapshot, auth } from "./lib/firebase";');
fs.writeFileSync('src/App.tsx', c);
