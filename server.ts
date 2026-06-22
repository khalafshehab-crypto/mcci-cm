import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json({ limit: "50mb" }));

  // API route for Gmail Proxy to bypass CORS lock in the browser
  app.post("/api/gmail-send", async (req, res) => {
    try {
      const { token, raw } = req.body;
      if (!token) {
        return res.status(400).json({ error: { message: "Access token is required" } });
      }
      if (!raw) {
        return res.status(400).json({ error: { message: "Raw message content is required" } });
      }

      const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      });

      const responseData = await response.text();
      if (!response.ok) {
        return res.status(response.status).json({ error: { message: responseData } });
      }

      let parsed = {};
      try {
        parsed = JSON.parse(responseData);
      } catch (e) {
        parsed = { rawData: responseData };
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error("Gmail Proxy Error:", err);
      return res.status(500).json({ error: { message: err.message || "Internal Server Error" } });
    }
  });

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
