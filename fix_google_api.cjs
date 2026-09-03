const fs = require('fs');
let code = fs.readFileSync('src/lib/googleApi.ts', 'utf8');

const oldFunc = `  let url = \`https://www.googleapis.com/\${endpoint}\`;
  if (endpoint.startsWith("sheets/")) {
    url = \`https://sheets.googleapis.com/\${endpoint.substring(7)}\`;
  } else if (endpoint.startsWith("docs/")) {
    url = \`https://docs.googleapis.com/\${endpoint.substring(5)}\`;
  } else if (endpoint.startsWith("slides/")) {
    url = \`https://slides.googleapis.com/\${endpoint.substring(7)}\`;
  } else if (endpoint.startsWith("gmail/")) {
    url = \`https://gmail.googleapis.com/\${endpoint.substring(6)}\`;
  } else if (endpoint.startsWith("calendar/")) {
    url = \`https://calendar.googleapis.com/\${endpoint.substring(9)}\`;
  } else if (endpoint.startsWith("tasks/")) {
    url = \`https://tasks.googleapis.com/\${endpoint.substring(6)}\`;
  } else if (endpoint.startsWith("forms/")) {
    url = \`https://forms.googleapis.com/\${endpoint.substring(6)}\`;
  } else if (endpoint.startsWith("chat/")) {
    url = \`https://chat.googleapis.com/\${endpoint.substring(5)}\`;
  }`;

const newFunc = `  let url = \`https://www.googleapis.com/\${endpoint}\`;
  if (endpoint.startsWith("sheets/")) {
    url = \`https://sheets.googleapis.com/\${endpoint.substring(7)}\`;
  } else if (endpoint.startsWith("docs/")) {
    url = \`https://docs.googleapis.com/\${endpoint.substring(5)}\`;
  } else if (endpoint.startsWith("slides/")) {
    url = \`https://slides.googleapis.com/\${endpoint.substring(7)}\`;
  } else if (endpoint.startsWith("forms/")) {
    url = \`https://forms.googleapis.com/\${endpoint.substring(6)}\`;
  } else if (endpoint.startsWith("chat/")) {
    url = \`https://chat.googleapis.com/\${endpoint.substring(5)}\`;
  } else if (endpoint.startsWith("gmail/")) {
    url = \`https://gmail.googleapis.com/\${endpoint}\`;
  } else if (endpoint.startsWith("tasks/")) {
    url = \`https://tasks.googleapis.com/\${endpoint}\`;
  }`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('src/lib/googleApi.ts', code);
