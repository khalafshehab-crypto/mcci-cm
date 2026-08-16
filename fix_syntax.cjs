const fs = require('fs');
const path = require('path');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            content = content.replace(/fetch\(\(\(window/g, 'fetch((window');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated syntax in ${fullPath}`);
            }
        }
    }
}

walk(path.join(__dirname, 'src'));
console.log('Done');
