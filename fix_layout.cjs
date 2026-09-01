const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const filterRegex = /    \/\/ If allowedPages is explicitly set, use it \(even if empty\)/;
const newFilter = `    // Strategic Dashboard (Reports page) is allowed for all employees
    if (page.path === "/reports") return true;

    // If allowedPages is explicitly set, use it (even if empty)`;

code = code.replace(filterRegex, newFilter);
fs.writeFileSync('src/components/Layout.tsx', code);
