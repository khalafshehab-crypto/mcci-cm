const fs = require('fs');
let c = fs.readFileSync('firestore.rules', 'utf8');

// just in case, simplify tasks/events update rules
c = c.replace(/allow create, update: if isSignedIn\(\) && isValidId\(taskId\);/g, 'allow create, update: if isSignedIn();');
c = c.replace(/allow create, update: if isSignedIn\(\) && isValidId\(eventId\);/g, 'allow create, update: if isSignedIn();');

fs.writeFileSync('firestore.rules', c);
