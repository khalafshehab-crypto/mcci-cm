import fetch from 'node-fetch';
const res = await fetch('http://localhost:3000/api/gemini/generate-new-letter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Hello",
    userApiKey: process.env.GEMINI_API_KEY
  })
});
const text = await res.text();
console.log("Response:", text);
