const fs = require('fs');
const path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('GlobalNotificationListener')) {
  code = code.replace(
    'import { Toaster } from "react-hot-toast";',
    'import { Toaster } from "react-hot-toast";\nimport { GlobalNotificationListener } from "./components/GlobalNotificationListener";'
  );

  code = code.replace(
    '<Toaster position="bottom-right" />',
    '<Toaster position="bottom-right" />\n      <GlobalNotificationListener />'
  );

  fs.writeFileSync(path, code);
  console.log("Patched App.tsx for GlobalNotificationListener");
}
