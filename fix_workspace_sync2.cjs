const fs = require('fs');
let code = fs.readFileSync('src/lib/workspaceSync.ts', 'utf8');

const startIndex = code.indexOf('if (myTasks.length > 0) {');
const endIndex = code.indexOf('const eventCollections =');

if (startIndex !== -1 && endIndex !== -1) {
    const toReplace = code.substring(startIndex, endIndex);
    code = code.replace(toReplace, `// Task syncing is now handled directly via createGoogleTask/updateGoogleTask with rich details.\n    `);
    fs.writeFileSync('src/lib/workspaceSync.ts', code);
    console.log("Successfully replaced");
} else {
    console.log("Not found");
}

