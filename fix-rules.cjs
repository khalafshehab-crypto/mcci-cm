const fs = require('fs');
let c = fs.readFileSync('firestore.rules', 'utf8');

c = c.replace(/allow read: if isSignedIn\(\);/g, 'allow read: if true;');
c = c.replace(/allow read, write: if isSignedIn\(\);/g, 'allow read: if true; allow write: if isSignedIn();');
c = c.replace(/allow read: if isSysAdmin\(\) \|\| isManager\(\);/g, 'allow read: if true;');

fs.writeFileSync('firestore.rules', c);
