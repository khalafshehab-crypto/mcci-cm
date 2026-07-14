const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf-8');

content = content.replace(
  'localStorage.removeItem("current_user");',
  'localStorage.removeItem("current_user");\n                        localStorage.removeItem("google_access_token");'
);

fs.writeFileSync('src/components/Layout.tsx', content);
