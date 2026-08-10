const fs = require('fs');
let content = fs.readFileSync('src/pages/Events.tsx', 'utf-8');

content = content.replace(
  /<div key="filter-popover-1784704070979-9">/g,
  '<div key="filter-popover-1784704070979-9" className="contents">'
);

content = content.replace(
  /<div key="filter-popover-1784704070979-10">/g,
  '<div key="filter-popover-1784704070979-10" className="contents">'
);

fs.writeFileSync('src/pages/Events.tsx', content);
console.log("Patched grid wrappers in Events.tsx");
