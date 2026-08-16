const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// We want to rewrite app.post("/api/gemini/extract-agenda")
// It looks like:
//   app.post("/api/gemini/extract-agenda", async (req, res) => {
//     try {
//       let { prompt, fileBase64, mimeType, fileId, accessToken } = req.body;
// ...
//       res.json({ result: response.text });
//     } catch (error) {
//       console.error("Error in /api/gemini/extract-agenda:", error);
//       res.status(500).json({ error: "Failed to extract agenda", details: error instanceof Error ? error.message : String(error) });
//     }
//   });

const regex = /app\.post\("\/api\/gemini\/extract-agenda", async \(req, res\) => \{[\s\S]*?\}\);/g;

const newEndpoint = `app.post("/api/gemini/extract-agenda", async (req, res) => {
    try {
      let { prompt, fileBase64, mimeType, fileId, accessToken } = req.body;
      let uploadedFileUri = null;
      let uploadedFileMime = null;
      
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      if (fileId && accessToken && !fileBase64) {
          try {
              const metaRes = await fetch(\`https://www.googleapis.com/drive/v3/files/\${fileId}?fields=mimeType,name\`, {
                  headers: { Authorization: \`Bearer \${accessToken}\` }
              });
              if (metaRes.ok) {
                  const meta = await metaRes.json();
                  mimeType = meta.mimeType;
                  let downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}?alt=media\`;
                  let ext = ".pdf";
                  
                  if (mimeType === 'application/vnd.google-apps.document') {
                      downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=application/pdf\`;
                      mimeType = 'application/pdf';
                  } else if (mimeType === 'application/vnd.google-apps.presentation') {
                      downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=application/pdf\`;
                      mimeType = 'application/pdf';
                  } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
                      downloadUrl = \`https://www.googleapis.com/drive/v3/files/\${fileId}/export?mimeType=text/csv\`;
                      mimeType = 'text/csv';
                      ext = ".csv";
                  }
                  
                  const fileRes = await fetch(downloadUrl, {
                      headers: { Authorization: \`Bearer \${accessToken}\` }
                  });
                  if (fileRes.ok) {
                      // Stream to a temp file
                      const tmpPath = require('path').join(require('os').tmpdir(), 'gemini_upload_' + Date.now() + ext);
                      const fsMod = require('fs');
                      const arrayBuffer = await fileRes.arrayBuffer();
                      fsMod.writeFileSync(tmpPath, Buffer.from(arrayBuffer));
                      
                      // Upload to Gemini
                      const upload = await ai.files.upload({ file: tmpPath, mimeType: mimeType });
                      uploadedFileUri = upload.uri;
                      uploadedFileMime = mimeType;
                      
                      // Cleanup
                      fsMod.unlinkSync(tmpPath);
                  } else {
                      console.error("Failed to download from Drive:", await fileRes.text());
                  }
              }
          } catch (e) {
              console.error("Drive fetch error in extract-agenda:", e);
          }
      }
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
      }
      
      let contents = [{ text: prompt }];
      if (uploadedFileUri) {
          contents = [
              { fileData: { fileUri: uploadedFileUri, mimeType: uploadedFileMime } },
              { text: prompt }
          ];
      } else if (fileBase64 && mimeType) {
          contents = [
              { inlineData: { data: fileBase64, mimeType: mimeType } },
              { text: prompt }
          ];
      }
      
      const response = await executeWithRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: contents }],
      }));
      
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Error in /api/gemini/extract-agenda:", error);
      res.status(500).json({ error: "Failed to extract agenda", details: error instanceof Error ? error.message : String(error) });
    }
  });`;

content = content.replace(regex, newEndpoint);

fs.writeFileSync('server.ts', content);
console.log("Rewrote server.ts to use Gemini File API");
