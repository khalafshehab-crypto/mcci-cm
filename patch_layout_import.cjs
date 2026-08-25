const fs = require('fs');
const file = 'src/components/Layout.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import NotificationCenter')) {
    code = code.replace(
      /import \{ Link, useLocation \} from "react-router-dom";/,
      \`$&
import NotificationCenter from "./NotificationCenter";\`
    );
}

fs.writeFileSync(file, code);
