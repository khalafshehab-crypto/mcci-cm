const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

content = content.replace(`            {filteredTemplates.map((t) => {
              if (t.id === "") console.log("FOUND EMPTY ID IN CARDS", t);
              return (
              <div`, `{filteredTemplates.map((t) => (\n              <div`);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
