const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/\s*Vite middleware for development[\s\S]*$/;
const newEnd = `  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
    import("vite").then(({ createServer }) => {
        createServer({
            server: { middlewareMode: true },
            appType: "spa",
        }).then((vite) => {
            app.use(vite.middlewares);
            app.listen(PORT, "0.0.0.0", () => {
                console.log(\`Server running on http://localhost:\${PORT}\`);
            });
        });
    });
  } else if (process.env.VERCEL !== "1") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
    app.listen(PORT, "0.0.0.0", () => {
        console.log(\`Server running on http://localhost:\${PORT}\`);
    });
  }
`;
code = code.replace(regex, newEnd);
fs.writeFileSync('server.ts', code);
