const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

if (!code.includes("RefreshCw")) {
  code = code.replace(/import \{.*?\} from 'lucide-react';/, (match) => {
    return match.replace("}", ", RefreshCw }");
  });
  fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
}
