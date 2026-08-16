const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// remove async function startServer() {
code = code.replace(/async function startServer\(\) \{\s*const app = express\(\);/, 'const app = express();\nexport default app;');
// remove the trailing } startServer();
code = code.replace(/\}\s*startServer\(\);\s*$/, '');

// Replace the vite block
const viteRegex = /if \(process\.env\.NODE_ENV !== "production"\) \{[\s\S]*?\} else \{[\s\S]*?app\.listen\(PORT, "0\.0\.0\.0", \(\) => \{[\s\S]*?\}\);\s*\}/;

const newViteBlock = `if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
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
}`;

code = code.replace(viteRegex, newViteBlock);
code = code.replace(/import \{ createServer as createViteServer \} from "vite";\n/, "");

fs.writeFileSync('server.ts', code);
console.log("Refactored server.ts");
