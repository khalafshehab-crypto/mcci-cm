const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

if (!code.includes("import { createGoogleTask }")) {
  code = code.replace(/import \{ showGlobalToast \} from '\.\.\/lib\/toastUtils';/, "import { showGlobalToast } from '../lib/toastUtils';\nimport { createGoogleTask } from '../lib/googleApi';");
  fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
}
