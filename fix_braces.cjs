const fs = require('fs');

function fixFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // The block we need to remove is:
    // } catch (uploadErr) {
    //     console.error("Drive auto-archive failed:", uploadErr);
    // }
    // }
    // Let's just find `// Auto-archive already done before fetch` and remove the trailing braces.
    const regex = /\/\/ Auto-archive already done before fetch[\s\S]*?console\.error\("Drive auto-archive failed:", uploadErr\);\s*\}\s*\}/g;
    content = content.replace(regex, '// Auto-archive already done before fetch');

    fs.writeFileSync(file, content);
    console.log("Fixed braces in " + file);
}
fixFile('src/pages/CommitteesEvents.tsx');
fixFile('src/pages/Events.tsx');
