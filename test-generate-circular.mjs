import fetch from 'node-fetch';
const res = await fetch('http://localhost:3000/api/gemini/generate-new-letter', {
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
const status = res.status;
const text = await res.text();
console.log("Status:", status);
console.log("Response:", text);
