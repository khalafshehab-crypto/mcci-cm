const fs = require('fs');

let mainContent = fs.readFileSync('src/main.tsx', 'utf8');
mainContent = mainContent.replace(/fetch\('\/api\/log'[\s\S]*?\}\)\.catch\(\(\)=>{}\);/, `
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.zIndex = '999999';
    el.style.backgroundColor = 'red';
    el.style.color = 'white';
    el.style.padding = '20px';
    el.innerText = 'DUPLICATE KEY: ' + args[1];
    document.body.appendChild(el);
`);
fs.writeFileSync('src/main.tsx', mainContent);
