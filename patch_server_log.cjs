const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
  app.post("/api/log", express.json(), (req, res) => {
    fs.appendFileSync('client_errors.log', JSON.stringify(req.body) + '\\n');
    res.json({ ok: true });
  });
`;

if (!code.includes('/api/log')) {
  code = code.replace('app.get("/api/health"', newEndpoint + '\n  app.get("/api/health"');
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts");
}
