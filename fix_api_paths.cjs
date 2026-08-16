const fs = require('fs');
const path = require('path');

const prefixStr = '((window.location.hostname.includes("vercel.app") ? "https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/" : "/api/") + ';

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // replace fetch("/api/gemini/ with fetch(prefixStr + "gemini/
            content = content.replace(/fetch\("(\/api\/)(gemini\/[^"]*)"/g, 'fetch(' + prefixStr + '"$2"');
            content = content.replace(/fetch\('(\/api\/)(gemini\/[^']*)'/g, 'fetch(' + prefixStr + '"$2"');
            
            content = content.replace(/fetch\("(\/api\/)(google-proxy[^"]*)"/g, 'fetch(' + prefixStr + '"$2"');
            content = content.replace(/fetch\('(\/api\/)(google-proxy[^']*)'/g, 'fetch(' + prefixStr + '"$2"');

            content = content.replace(/fetch\("(\/api\/)(fetch-public-sheet[^"]*)"/g, 'fetch(' + prefixStr + '"$2"');
            content = content.replace(/fetch\('(\/api\/)(fetch-public-sheet[^']*)'/g, 'fetch(' + prefixStr + '"$2"');

            // Also check for fetch("/api/" + "gemini/...")
            content = content.replace(/fetch\("\/api\/" \+ "gemini\//g, 'fetch(' + prefixStr + '"gemini/');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

walk(path.join(__dirname, 'src'));
console.log('Done');
