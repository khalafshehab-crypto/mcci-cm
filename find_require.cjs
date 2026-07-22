const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'dist', 'assets');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const matches = content.match(/require\((['"])([^'"]+)\1\)/g);
  if (matches) {
    console.log(file, matches);
  }
}
