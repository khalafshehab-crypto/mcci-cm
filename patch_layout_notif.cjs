const fs = require('fs');
const file = 'src/components/Layout.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import NotificationCenter')) {
    code = code.replace(
      /import \{.*\} from "lucide-react";/,
      `$&
import NotificationCenter from "./NotificationCenter";`
    );
}

const oldDiv = `<div className="flex flex-row-reverse items-center gap-2 pr-0 pt-2 md:pt-0">`;
const newDiv = `<div className="flex flex-row-reverse items-center gap-2 pr-0 pt-2 md:pt-0">
            <NotificationCenter />`;

if (code.includes(oldDiv) && !code.includes("<NotificationCenter />")) {
    code = code.replace(oldDiv, newDiv);
}

fs.writeFileSync(file, code);
