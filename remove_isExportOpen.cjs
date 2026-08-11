const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const regex = /\{\/\* 📊 GOOGLE SHEETS DYNAMIC EXPORT MODAL \*\/\}\s*<AnimatePresence>\s*\{isExportOpen && \([\s\S]*?<\/AnimatePresence>/;

if (regex.test(content)) {
    content = content.replace(regex, "");
    fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
    console.log("Removed old export modal successfully!");
} else {
    console.log("Could not find old export modal block.");
}
