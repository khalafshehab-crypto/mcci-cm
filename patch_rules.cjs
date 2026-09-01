const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

// First remove what I just appended
code = code.replace(/\n    \/\/ 10\. Delegations\n    match \/delegations\/{delegationId} {\n      allow read: if isSignedIn\(\);\n      allow create, update: if isSignedIn\(\) && isValidId\(delegationId\);\n      allow delete: if isSysAdmin\(\) || isManager\(\);\n    }\n/g, '');

const insertion = `
    // 10. Missing Collections (Delegations, Centers, etc.)
    match /delegations/{delegationId} {
      allow read, write: if isSignedIn();
    }
    match /centers_events/{docId} {
      allow read, write: if isSignedIn();
    }
    match /centers_list/{docId} {
      allow read, write: if isSignedIn();
    }
    match /affiliates_events/{docId} {
      allow read, write: if isSignedIn();
    }
    match /affiliates_list/{docId} {
      allow read, write: if isSignedIn();
    }
    match /secgen_events/{docId} {
      allow read, write: if isSignedIn();
    }
    match /secgen_list/{docId} {
      allow read, write: if isSignedIn();
    }
  }
}
`;

code = code.replace(/  \}\n\}\n?$/, insertion);
fs.writeFileSync('firestore.rules', code);
console.log("Rules patched.");
