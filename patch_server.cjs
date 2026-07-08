const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const route = `
  app.post("/api/fetch-public-sheet", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: "URL is required" });
      
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch from URL" });
      }
      
      const buffer = await response.arrayBuffer();
      res.set('Content-Type', 'application/octet-stream');
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error("Fetch Public Sheet Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/health"`;

content = content.replace(/  app\.get\("\/api\/health"/, route);
fs.writeFileSync('server.ts', content);
console.log("Patched server.ts");
