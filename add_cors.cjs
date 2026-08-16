const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('import cors from "cors";')) {
    code = code.replace('import express from "express";', 'import express from "express";\nimport cors from "cors";');
    code = code.replace('const app = express();', 'const app = express();\napp.use(cors({ origin: true }));'); // Allow any origin, or we could specify vercel.app
    fs.writeFileSync('server.ts', code);
    console.log("Added CORS");
} else {
    console.log("CORS already added");
}
