const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/**/*.{ts,tsx}');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // e.title.toLowerCase().includes(term) => (e.title || "").toLowerCase().includes(term)
  content = content.replace(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\.toLowerCase\(\)\.includes\(/g, '($1.$2 || "").toLowerCase().includes(');

  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content, 'utf8');
    console.log("Updated", file);
  }
}
