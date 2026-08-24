const fs = require('fs');
const file = 'src/pages/CommitteesLibrary.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /committeeUrls\.push\(\{[\s\S]*?\}\);/g;
code = code.replace(regex, (match) => {
    return match + '\n        await new Promise(resolve => setTimeout(resolve, 800));';
});

fs.writeFileSync(file, code);
