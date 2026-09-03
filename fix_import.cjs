const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

if (!code.match(/import \{.*?RefreshCw.*?\} from 'lucide-react';/)) {
  code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { $1, RefreshCw } from 'lucide-react';");
  fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
}
