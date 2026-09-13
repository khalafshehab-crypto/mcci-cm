const fs = require('fs');

const file = '/app/applet/index.html';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<meta name="viewport" content=".*?" \/>/g, '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />');
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}
