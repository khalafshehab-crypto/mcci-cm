const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

// Replace "allow delete: if isManager();" with "allow delete: if isManager() || isSysAdmin();"
code = code.replace(/allow delete: if isManager\(\);/g, 'allow delete: if isManager() || isSysAdmin();');
// Let's also do the same for create and update where appropriate, actually SysAdmin should be able to do everything a manager can do.
// So let's just update isManager() definition or just replace.
// Actually, it's safer to redefine isManager to include isSysAdmin? No, maybe SysAdmin isn't a manager logically.
// Replacing 'allow delete: if isManager();' is safe and hits Committees, Events, Tasks, Recommendations, Members.

fs.writeFileSync('firestore.rules', code);
console.log("Admin rules patched.");
