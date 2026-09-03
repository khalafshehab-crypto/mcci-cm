const fs = require('fs');
let text = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');
text = text.replace(/\|\s*"table">\("grid"\);/, 'const [viewMode, setViewMode] = useState<"grid" | "table">("grid");');
fs.writeFileSync('src/pages/OrgChart.tsx', text);
