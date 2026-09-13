const fs = require('fs');

let content = fs.readFileSync('/app/applet/src/lib/googleApi.ts', 'utf8');

if (content.includes('if (response.status === 204) return null;\n    return response.json();')) {
  content = content.replace(
    /if \(response\.status === 204\) return null;\n\s*return response\.json\(\);/,
    `if (response.status === 204) return null;
    const text = await response.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch (e) { return text; }`
  );
  fs.writeFileSync('/app/applet/src/lib/googleApi.ts', content);
  console.log("Patched fetchGoogleAPI");
}
