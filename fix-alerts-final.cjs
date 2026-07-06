const fs = require('fs');

function patch(file, linesToChange) {
    let lines = fs.readFileSync(file, 'utf8').split('\n');
    linesToChange.forEach(lineNum => {
        let idx = lineNum - 1;
        lines[idx] = lines[idx].replace(/alert\("[^"]+"\); /, '');
    });
    fs.writeFileSync(file, lines.join('\n'));
}

patch('src/pages/CommitteesEvents.tsx', [504, 517]);
patch('src/pages/CommitteesRecommendations.tsx', [531, 544]);

console.log('done');
