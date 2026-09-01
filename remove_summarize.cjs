const fs = require('fs');
const path = 'server.ts';
let code = fs.readFileSync(path, 'utf8');

const startIdx = code.indexOf('app.post("/api/gemini/summarize-minutes"');
const endMarker = 'return res.json({ result: JSON.parse(rawText) });\n    } catch (err) {\n      console.error("Gemini Summarize Minutes Error:", err);\n      return res.status(500).json({ error: err.message || "Internal Server Error" });\n    }\n  });';
const endIdx = code.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  code = code.slice(0, startIdx) + code.slice(endIdx + endMarker.length);
  fs.writeFileSync(path, code);
  console.log("Removed summarize API successfully");
} else {
  console.log("Could not find summarize API end", startIdx, endIdx);
}
