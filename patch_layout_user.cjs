const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');
code = code.replace(
  '} from "lucide-react";',
  '  User,\n} from "lucide-react";'
);
fs.writeFileSync('src/components/Layout.tsx', code);
