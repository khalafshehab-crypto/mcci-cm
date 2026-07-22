const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

const replacement = `            {filteredTemplates.map((t) => {
              if (t.id === "") console.log("FOUND EMPTY ID IN CARDS", t);
              return (
              <div`;

content = content.replace('{filteredTemplates.map((t) => (\n              <div', replacement);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
