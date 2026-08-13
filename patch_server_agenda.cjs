const fs = require('fs');
let serverTs = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
  app.post("/api/gemini/extract-agenda", async (req, res) => {
    try {
      const { prompt, fileBase64, mimeType } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
      }
      
      const { GoogleGenAI } = require("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });
      
      let contents = [prompt];
      if (fileBase64 && mimeType) {
        contents = [
          { inlineData: { data: fileBase64, mimeType: mimeType } },
          prompt
        ];
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });
      
      const text = response.text;
      res.json({ result: text });
    } catch (error) {
      console.error("Error in /api/gemini/extract-agenda:", error);
      res.status(500).json({ error: "Failed to extract agenda" });
    }
  });
`;

// Insert the new endpoint before app.post("/api/gemini/reply-to-letter"
serverTs = serverTs.replace('  app.post("/api/gemini/reply-to-letter"', newEndpoint + '\n  app.post("/api/gemini/reply-to-letter"');
fs.writeFileSync('server.ts', serverTs);
console.log('Added /api/gemini/extract-agenda to server.ts');
