const fs = require('fs');
const file = 'src/lib/googleApi.ts';
let code = fs.readFileSync(file, 'utf8');

// Inside fetchGoogleAPI, look for `if (response.status === 401) {`
const searchStr = `if (response.status === 401) {`;
const replaceStr = `if (response.status === 401) {
        if (customToken) {
           console.warn("Target user token expired. Failing silently instead of asking the current user.");
           throw new Error("Target user token expired.");
        }`;

code = code.replace(searchStr, replaceStr);

fs.writeFileSync(file, code);
console.log("Fixed custom token 401");
