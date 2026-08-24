const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/catch \(err: any\) \{/g, "catch (err: any) { console.error('executeWithRetry error on attempt', i, err.message);");
fs.writeFileSync('server.ts', code);
