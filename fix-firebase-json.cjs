const fs = require('fs');
let j = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));

if (j.firestore && Array.isArray(j.firestore)) {
  j.firestore = {
    rules: "firestore.rules"
  };
}

fs.writeFileSync('firebase.json', JSON.stringify(j, null, 2));
