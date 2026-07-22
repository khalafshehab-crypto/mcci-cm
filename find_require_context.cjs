const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'dist', 'assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const match = content.indexOf('require("@emotion/is-prop-valid")');
  if (match !== -1) {
    console.log(file, content.substring(match - 50, match + 50));
  }
}
