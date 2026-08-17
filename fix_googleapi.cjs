const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/lib/googleApi.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /if \(!metaRes\.ok\) \{\s*const errText = await metaRes\.text\(\);\s*console\.error\("Drive metadata fetch failed:", errText\);\s*throw new Error\("Failed to fetch file metadata: " \+ errText\);\s*\}/g,
    `if (!metaRes.ok) {
    const errText = await metaRes.text();
    console.error("Drive metadata fetch failed:", errText);
    
    // If the error is an HTML page (like the 404 from Vercel we saw), don't show the whole HTML
    let displayErr = errText;
    if (displayErr.includes('<html')) {
       displayErr = "File not found or permission denied on Google Drive.";
    } else {
       try {
           const parsed = JSON.parse(errText);
           if (parsed.error && parsed.error.message) {
               displayErr = parsed.error.message;
           }
       } catch(e) {}
    }
    throw new Error("Failed to fetch file metadata: " + displayErr);
  }`
);

fs.writeFileSync(file, content);
console.log("googleApi.ts fixed");
