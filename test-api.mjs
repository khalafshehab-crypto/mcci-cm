import fetch from 'node-fetch';
const res = await fetch('http://localhost:3000/api/health');
const text = await res.text();
console.log("Health:", res.status, text);

const res2 = await fetch('http://localhost:3000/api/gemini/generate-new-letter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userApiKey: process.env.GEMINI_API_KEY,
    mode: undefined,
    workspaceService: "circular",
    replyFileBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    replyFileMimeType: "image/png",
    committeeName: "Test Committee",
    subject: "Test Subject",
    details: "Test Details"
  })
});
const text2 = await res2.text();
console.log("Generate:", res2.status, text2.substring(0, 100));
