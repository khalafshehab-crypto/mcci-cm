const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace standard catch blocks in server.ts to return actual error messages
content = content.replace(/res\.status\(500\)\.json\(\{ error: "Failed to ([^"]+)" \}\);/g, 'res.status(500).json({ error: "Failed to $1", details: error instanceof Error ? error.message : String(error) });');
fs.writeFileSync('server.ts', content);
console.log("Patched server.ts");
