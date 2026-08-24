const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
/      const userParts: any\[\] = \[\];\s*if \(replyFileBase64 && typeof replyFileBase64 === "string" && replyFileMimeType\) \{\s*userParts\.push\(\{\s*inlineData: \{\s*data: replyFileBase64,\s*mimeType: replyFileMimeType\s*\}\s*\}\);\s*\}/,
`      const userParts: any[] = [];
      
      if (replyFileBase64 && typeof replyFileBase64 === "string" && replyFileMimeType) {
        try {
          const uri = await uploadBase64ToGemini(ai, replyFileBase64, replyFileMimeType);
          userParts.push({ fileData: { fileUri: uri, mimeType: replyFileMimeType } });
        } catch (uploadErr) {
          console.error("Upload to Gemini File API failed, falling back to inlineData", uploadErr);
          userParts.push({
            inlineData: {
              data: replyFileBase64,
              mimeType: replyFileMimeType
            }
          });
        }
      }`
);

fs.writeFileSync('server.ts', content);
